'use client'

import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Pause,
  Clock,
  CheckCircle,
  HelpCircle,
  Volume2,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

export default function TrackComplaint() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const complaintId = searchParams.get('id')
  
  const [complaint, setComplaint] = React.useState<any>(null)
  const [userComplaints, setUserComplaints] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false)

  const handleAudioPlayback = () => {
    setIsPlayingAudio(true)
    setTimeout(() => setIsPlayingAudio(false), 3000)
  }

  React.useEffect(() => {
    const user = getUser()
    if (!user) {
      navigate('/login')
      return
    }

    const userId = user.id

    async function loadData(showLoading = true) {
      if (showLoading) setLoading(true)
      try {
        // Fetch all complaints for user
        const { data: allComplaints, error: listError } = await supabase
          .from('complaints')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (listError) throw listError
        setUserComplaints(allComplaints || [])

        // Determine which complaint to view
        let activeComplaint = null
        if (complaintId) {
          activeComplaint = allComplaints?.find(c => c.id === complaintId) || null
          if (!activeComplaint) {
            const { data: directComp, error: directError } = await supabase
              .from('complaints')
              .select('*')
              .eq('id', complaintId)
              .maybeSingle()
            if (!directError && directComp) {
              activeComplaint = directComp
            }
          }
        } else if (allComplaints && allComplaints.length > 0) {
          activeComplaint = allComplaints[0]
          setSearchParams({ id: activeComplaint.id })
        }

        setComplaint(activeComplaint)
      } catch (err) {
        console.error('Error loading complaints:', err)
      } finally {
        if (showLoading) setLoading(false)
      }
    }

    loadData()

    // Realtime listener for user complaints
    const channel = supabase
      .channel(`user-complaints-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadData(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [complaintId, navigate, setSearchParams])

  const getCategoryLabel = (cat: string) => {
    const categories: Record<string, string> = {
      water: 'Water Supply',
      electricity: 'Electricity / Light',
      roads: 'Road Repair',
      sanitation: 'Sanitation',
      health: 'Health Service',
      agri: 'Agriculture',
    }
    return categories[cat] || cat
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return {
          label: 'Resolved',
          class: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
        }
      case 'progress':
      case 'in progress':
      case 'assigned':
        return {
          label: 'In Progress',
          class: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400'
        }
      case 'review':
      case 'under review':
        return {
          label: 'Under Review',
          class: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400'
        }
      default:
        return {
          label: 'Registered',
          class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-450'
        }
    }
  }

  const getTimelineSteps = (c: any) => {
    const steps = []
    const createdDate = new Date(c.created_at).toLocaleString()
    
    // Step 1: Registered
    steps.push({
      title: 'Voice Record Submitted',
      description: 'Your voice complaint was successfully registered on our portal.',
      date: createdDate,
      status: 'completed',
    })

    // Step 2: Under Review
    const isReviewOrLater = ['review', 'assigned', 'progress', 'resolved'].includes(c.status?.toLowerCase())
    const isReviewActive = c.status?.toLowerCase() === 'review'
    steps.push({
      title: 'Under Panchayat Review',
      description: c.admin_note 
        ? `Review note: "${c.admin_note}"`
        : 'The Panchayat Administrator is reviewing the details and setting priorities.',
      date: isReviewOrLater ? 'Reviewed' : 'Awaiting review',
      status: isReviewActive ? 'active' : isReviewOrLater ? 'completed' : 'pending',
    })

    // Step 3: Assigned to Department
    const isAssignedOrLater = ['assigned', 'progress', 'resolved'].includes(c.status?.toLowerCase())
    const isAssignedActive = c.status?.toLowerCase() === 'assigned'
    steps.push({
      title: 'Assigned to Department',
      description: c.assigned_department
        ? `Assigned to ${c.assigned_department} department.`
        : 'Ticket will be routed to the specific maintenance division.',
      date: isAssignedOrLater ? 'Assigned' : 'Pending route',
      status: isAssignedActive ? 'active' : isAssignedOrLater ? 'completed' : 'pending',
    })

    // Step 4: Work in Progress
    const isProgressOrLater = ['progress', 'resolved'].includes(c.status?.toLowerCase())
    const isProgressActive = c.status?.toLowerCase() === 'progress'
    steps.push({
      title: 'Work in Progress',
      description: c.assigned_officer 
        ? `Officer ${c.assigned_officer} has been dispatched to investigate and resolve the issue.`
        : 'Repair crew dispatch and logistics setup.',
      date: isProgressOrLater ? 'In Progress' : 'Pending dispatch',
      status: isProgressActive ? 'active' : isProgressOrLater ? 'completed' : 'pending',
    })

    // Step 5: Resolution
    const isResolved = c.status?.toLowerCase() === 'resolved'
    steps.push({
      title: 'Resolution Confirmed',
      description: isResolved 
        ? 'Panchayat verified the fix. The ticket is now closed.' 
        : 'Panchayat will upload the resolution report.',
      date: isResolved ? 'Completed' : 'Pending verification',
      status: isResolved ? 'completed' : 'pending',
    })

    return steps
  }

  const badge = complaint ? getStatusBadge(complaint.status) : null
  const timelineSteps = complaint ? getTimelineSteps(complaint) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-16 font-sans text-foreground">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-950/70 border-b border-emerald-500/10 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/villager-dashboard')}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-emerald-500/5 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>
          <h1 className="font-poppins font-bold text-base leading-tight">Complaint Tracking Portal</h1>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-sm font-bold font-mono">
            ID
          </div>
        </div>
      </header>

      {/* Main Track content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-sm font-semibold text-muted-foreground">
            Loading complaints data...
          </div>
        ) : !complaint ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground text-sm font-semibold">
              You haven&apos;t filed any complaints yet.
            </p>
            <button
              onClick={() => navigate('/record-complaint')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              Record Voice Complaint
            </button>
          </div>
        ) : (
          <>
            {/* Complaint Switcher if there are multiple */}
            {userComplaints.length > 1 && (
              <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-border">
                <span className="text-xs font-bold text-muted-foreground shrink-0">Switch Ticket:</span>
                <select
                  value={complaintId || ''}
                  onChange={(e) => setSearchParams({ id: e.target.value })}
                  className="text-xs font-bold py-1 px-2.5 rounded-lg border bg-white dark:bg-slate-950 cursor-pointer"
                >
                  {userComplaints.map((uc: any) => (
                    <option key={uc.id} value={uc.id}>
                      {uc.id} - {getCategoryLabel(uc.category)} ({uc.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info Header Card */}
            <section className="p-6 rounded-3xl border-2 border-emerald-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold font-mono text-muted-foreground">Complaint ID</p>
                  <h2 className="text-2xl font-poppins font-extrabold text-foreground">{complaint.id}</h2>
                </div>
                {badge && (
                  <span className={`text-xs px-3 py-1 font-bold rounded-lg border ${badge.class}`}>
                    {badge.label}
                  </span>
                )}
              </div>

              <div className="grid gap-3 pt-3 border-t border-border grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Category</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{getCategoryLabel(complaint.category)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Estimated Fix</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {complaint.estimated_fix_time || 'Within 24 Hours'}
                  </p>
                </div>
              </div>
            </section>

            {/* Audio Memo playback */}
            <section className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-4">
              <button
                onClick={handleAudioPlayback}
                className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/10 cursor-pointer hover:bg-emerald-500 transition-colors"
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 pl-0.5" />
                )}
              </button>
              <div className="flex-grow space-y-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Volume2 className={`w-4 h-4 text-emerald-500 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  Your Submitted Voice Record
                </h4>
                <p className="text-xs italic text-muted-foreground">
                  &quot;{complaint.transcript || 'Voice complaint filed.'}&quot;
                </p>
              </div>
            </section>

            {/* Live Progress Tracker */}
            <section className="p-6 rounded-3xl border-2 border-emerald-500/10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm shadow-lg space-y-6">
              <h3 className="text-base font-poppins font-bold text-foreground pb-2 border-b border-border">
                Live Status Progression
              </h3>

              {/* Progress Bar Container */}
              <div className="relative py-4">
                <div className="flex items-center justify-between relative">
                  {/* Background progress track */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0" />
                  
                  {/* Animated Foreground track */}
                  <motion.div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 z-0 ${
                      complaint.status?.toLowerCase() === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{
                      width: 
                        complaint.status?.toLowerCase() === 'rejected'
                          ? '100%'
                          : complaint.status?.toLowerCase() === 'resolved'
                          ? '100%'
                          : (complaint.status?.toLowerCase() === 'in progress' || complaint.status?.toLowerCase() === 'in-progress' || complaint.status?.toLowerCase() === 'assigned')
                          ? '50%'
                          : '0%'
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />

                  {/* Nodes */}
                  {complaint.status?.toLowerCase() === 'rejected' ? (
                    <>
                      <div className="flex flex-col items-center z-10">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] text-white font-extrabold">✓</div>
                        <span className="text-[10px] font-bold text-emerald-500 mt-1">Pending</span>
                      </div>
                      <div className="flex flex-col items-center z-10">
                        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] text-white font-extrabold">✕</div>
                        <span className="text-[10px] font-bold text-red-500 mt-1">Rejected</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Node 1: Pending */}
                      <div className="flex flex-col items-center z-10">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] text-white font-extrabold">✓</div>
                        <span className="text-[10px] font-bold text-emerald-500 mt-1">Pending</span>
                      </div>
                      
                      {/* Node 2: In Progress */}
                      {(() => {
                        const isInProgress = ['in progress', 'in-progress', 'assigned', 'resolved'].includes(complaint.status?.toLowerCase())
                        return (
                          <div className="flex flex-col items-center z-10">
                            <div className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-extrabold ${
                              isInProgress ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {isInProgress ? '✓' : '2'}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 ${isInProgress ? 'text-emerald-500' : 'text-slate-400'}`}>In Progress</span>
                          </div>
                        )
                      })()}

                      {/* Node 3: Resolved */}
                      {(() => {
                        const isResolved = complaint.status?.toLowerCase() === 'resolved'
                        return (
                          <div className="flex flex-col items-center z-10">
                            <div className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-extrabold ${
                              isResolved ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {isResolved ? '✓' : '3'}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 ${isResolved ? 'text-emerald-500' : 'text-slate-400'}`}>Resolved</span>
                          </div>
                        )
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Timestamp & Notes info */}
              <div className="mt-4 pt-4 border-t border-border space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                  <span>Last Updated: {new Date(complaint.created_at).toLocaleString()}</span>
                  <span>Priority: {complaint.priority}</span>
                </div>
                
                {complaint.admin_note && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
                    <p className="font-bold text-foreground">Admin Note:</p>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 italic">&quot;{complaint.admin_note}&quot;</p>
                  </div>
                )}
              </div>
            </section>

            {/* Status Timeline */}
            <section className="p-6 rounded-3xl border-2 border-emerald-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg space-y-6">
              <h3 className="text-base font-poppins font-bold text-foreground pb-2 border-b border-border">
                Resolution Progress Timeline
              </h3>

              <div className="relative border-l border-border pl-6 space-y-6 ml-2.5">
                {timelineSteps.map((step: any, idx: number) => {
                  const isCompleted = step.status === 'completed'
                  const isActive = step.status === 'active'

                  return (
                    <div key={idx} className="relative">
                      {/* Circle Indicator */}
                      <span
                        className={`absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center ${
                          isCompleted
                            ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                            : isActive
                            ? 'border-blue-500 text-blue-500 bg-blue-500/10 animate-pulse'
                            : 'border-slate-300'
                        }`}
                      >
                        {isCompleted && <CheckCircle className="w-3.5 h-3.5 fill-white dark:fill-slate-950" />}
                      </span>

                      <div className="space-y-1">
                        <h4
                          className={`font-poppins font-bold text-sm ${
                            isCompleted
                              ? 'text-foreground font-semibold'
                              : isActive
                              ? 'text-blue-500 font-bold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                          {step.date}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* Resubmit / Help Section */}
        <section className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-border flex gap-3 text-xs">
          <HelpCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-foreground">Need to add more details?</h4>
            <p className="text-muted-foreground leading-relaxed">
              If the problem has worsened, or if you want to provide update details, you can record a new voice update to link with this ticket.
            </p>
            <button
              onClick={() => navigate('/record-complaint')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 cursor-pointer"
            >
              Record Update Details →
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
