'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '../../components/admin-layout'
import {
  Search,
  Play,
  Pause,
  ShieldAlert,
  HelpCircle,
  Volume2,
  Briefcase,
  Sparkles
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface Complaint {
  id: string
  villager: string
  phone: string
  ward: string
  category: 'water' | 'electricity' | 'roads' | 'sanitation' | 'health' | 'agri'
  description: string
  date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  audioDuration: string
  voiceTranscript: string
  adminNotes?: string
  createdAt?: string
  assignedTeam?: string
}

const statusMapToDB = (status: string) => {
  if (status === 'pending') return 'Pending'
  if (status === 'in-progress') return 'In Progress'
  if (status === 'resolved') return 'Resolved'
  if (status === 'rejected') return 'Rejected'
  return status
}

const priorityMapToDB = (priority: string) => {
  if (priority === 'low') return 'Low'
  if (priority === 'medium') return 'Medium'
  if (priority === 'high') return 'High'
  if (priority === 'critical') return 'Critical'
  return priority
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = React.useState<Complaint[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest')
  
  // Modal/Review state
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null)
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null)
  const [tempNotes, setTempNotes] = React.useState('')
  const [tempTeam, setTempTeam] = React.useState('')
  const [tempStatus, setTempStatus] = React.useState<any>('pending')
  const [tempPriority, setTempPriority] = React.useState<any>('low')

  // Expanded transcripts state
  const [expandedIds, setExpandedIds] = React.useState<React.SetStateAction<any>>(() => new Set<string>())

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedIds((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function loadComplaints() {
    setLoading(true)
    try {
      const { data: comps, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (comps) {
        const userIds = comps.map((c: any) => c.user_id)
        const { data: userList } = await supabase
          .from('users')
          .select('id, name, phone')
          .in('id', userIds)

        const userMap = (userList || []).reduce((acc: any, curr: any) => {
          acc[curr.id] = curr
          return acc
        }, {})

        const mapped: Complaint[] = comps.map((c: any) => {
          const u = userMap[c.user_id]
          const priorityVal = c.priority?.toLowerCase()
          let statusVal = c.status?.toLowerCase()
          if (statusVal === 'in progress') {
            statusVal = 'in-progress'
          }
          return {
            id: c.id,
            villager: u?.name || 'Citizen',
            phone: u?.phone || 'No phone',
            ward: 'Ward 3',
            category: (c.category?.toLowerCase() === 'water' || c.category?.toLowerCase() === 'electricity' || c.category?.toLowerCase() === 'roads' || c.category?.toLowerCase() === 'sanitation' || c.category?.toLowerCase() === 'health' || c.category?.toLowerCase() === 'agri')
              ? c.category.toLowerCase() as any
              : 'water',
            description: c.transcript || 'Voice complaint recorded.',
            date: new Date(c.created_at).toLocaleString(),
            priority: (priorityVal === 'low' || priorityVal === 'medium' || priorityVal === 'high' || priorityVal === 'critical')
              ? priorityVal as any
              : 'medium',
            status: (statusVal === 'pending' || statusVal === 'in-progress' || statusVal === 'resolved' || statusVal === 'rejected')
              ? statusVal as any
              : 'pending',
            audioDuration: '0:20',
            voiceTranscript: c.transcript || 'Voice complaint recorded.',
            adminNotes: c.admin_note || '',
            assignedTeam: '',
            createdAt: c.created_at
          }
        })
        setComplaints(mapped)
      }
    } catch (err) {
      console.error('Error fetching admin complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadComplaints()

    // Realtime channel listener for complaints updates
    const channel = supabase
      .channel('complaints-admin-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints'
        },
        () => {
          loadComplaints()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAudioToggle = (id: string, duration: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingAudioId === id) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(id)
      setTimeout(() => setPlayingAudioId(null), 5000)
    }
  }

  const handleOpenDetailModal = (comp: Complaint) => {
    setSelectedComplaint(comp)
    setTempNotes(comp.adminNotes || '')
    setTempTeam(comp.assignedTeam || '')
    setTempStatus(comp.status)
    setTempPriority(comp.priority)
  }

  const handleSaveDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedComplaint) return

    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          admin_note: tempNotes,
          status: statusMapToDB(tempStatus),
          priority: priorityMapToDB(tempPriority)
        })
        .eq('id', selectedComplaint.id)

      if (error) throw error

      setComplaints(prev =>
        prev.map(c =>
          c.id === selectedComplaint.id
            ? {
                ...c,
                adminNotes: tempNotes,
                status: tempStatus,
                priority: tempPriority
              }
            : c
        )
      )
      setSelectedComplaint(null)
      toast.success('Complaint records updated successfully.')
    } catch (err) {
      console.error('Error updating complaint in DB:', err)
      toast.error('Failed to update complaint details. Please try again.')
    }
  }

  const handleEscalate = async (id: string) => {
    try {
      const escalatedNotes = (tempNotes || '') + ' [Escalated to Block Officer]'
      const { error } = await supabase
        .from('complaints')
        .update({
          priority: 'Critical',
          admin_note: escalatedNotes
        })
        .eq('id', id)

      if (error) throw error

      setComplaints(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, priority: 'critical', adminNotes: escalatedNotes }
            : c
        )
      )
      if (selectedComplaint) {
        setTempPriority('critical')
        setTempNotes(escalatedNotes)
      }
      toast.success('Complaint escalated successfully to Critical priority!')
    } catch (err) {
      console.error('Error escalating complaint:', err)
      toast.error('Failed to escalate complaint. Please try again.')
    }
  }

  const filtered = complaints.filter(comp => {
    const matchesSearch =
      comp.villager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.voiceTranscript.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || comp.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || comp.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime()
      const timeB = new Date(b.createdAt || 0).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })
  }, [filtered, sortOrder])

  return (
    <AdminLayout title="Complaint Management Center">
      {/* Filtering toolbar */}
      <section className="p-5 rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search by villager name, ticket ID, or transcription keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-300">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Depts</option>
              <option value="water">Water Supply</option>
              <option value="electricity">Electricity</option>
              <option value="roads">Road Repairs</option>
              <option value="sanitation">Sanitation</option>
              <option value="health">Healthcare</option>
              <option value="agri">Agriculture</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main complaint grid/table list */}
      <section className="space-y-4">
        {loading ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-gray-300 text-xs font-semibold">
            Loading complaints registry from Panchayat...
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid gap-4">
            {sorted.map((comp) => {
              const isPlaying = playingAudioId === comp.id
              const isInProgress = comp.status === 'in-progress'
              const isResolved = comp.status === 'resolved'
              const isRejected = comp.status === 'rejected'

              return (
                <div
                  key={comp.id}
                  onClick={() => handleOpenDetailModal(comp)}
                  className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                        <span className="font-mono text-blue-450">{comp.id}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-200">{comp.villager} ({comp.ward})</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300 font-normal">{comp.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 capitalize mt-1">
                        Category: {comp.category}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {/* Priority Tag */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        comp.priority === 'critical'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : comp.priority === 'high'
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          : comp.priority === 'medium'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : 'bg-slate-500/10 border-slate-500/20 text-gray-250'
                      }`}>
                        {comp.priority}
                      </span>

                      {/* Status Tag */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        isResolved
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : isInProgress
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : isRejected
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {comp.status}
                      </span>

                      {/* Voice Badge */}
                      {comp.voiceTranscript && (
                        <span className="px-2.5 py-0.5 rounded text-[9px] uppercase font-extrabold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          🎤 Voice Complaint
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Transcription Container */}
                  <div className="space-y-1 text-left bg-slate-900/40 p-3.5 rounded-2xl border border-emerald-500/15 shadow-inner">
                    <div className="flex items-center justify-between text-[9px] font-bold text-emerald-400 pb-1 border-b border-slate-800/40 mb-1.5 w-full">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        AI Voice Transcription
                      </span>
                      {comp.description.length > 120 && (
                        <button
                          onClick={(e) => toggleExpand(comp.id, e)}
                          className="text-[10px] text-blue-400 hover:underline cursor-pointer select-none font-bold capitalize"
                        >
                          {expandedIds.has(comp.id) ? 'Show Less' : 'Show More...'}
                        </button>
                      )}
                    </div>
                    <p className={`text-xs text-gray-200 leading-relaxed font-sans ${
                      expandedIds.has(comp.id) ? '' : 'line-clamp-2'
                    }`}>
                      {comp.description}
                    </p>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-850/50 text-[11px] leading-snug">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleAudioToggle(comp.id, comp.audioDuration, e)}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-colors"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 pl-0.5" />}
                      </button>
                      <div className="space-y-0.5 text-left">
                        <p className="font-bold text-slate-300">Voice Record ({comp.audioDuration})</p>
                        <p className="italic text-gray-300 font-mono truncate max-w-[200px] sm:max-w-md">
                          &quot;{comp.voiceTranscript}&quot;
                        </p>
                      </div>
                    </div>

                    {comp.assignedTeam && (
                      <span className="flex items-center gap-1 font-semibold text-slate-400 self-end sm:self-center">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                        {comp.assignedTeam}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-gray-300 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            No complaints found matching selected filter options or search queries.
          </div>
        )}
      </section>

      {/* Edit Detail Modal Drawer */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{selectedComplaint.id}</span>
                  <h3 className="font-poppins font-bold text-base text-slate-200">
                    Review and Dispatch Control
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-850 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Villager & Core info */}
              <div className="grid gap-3 grid-cols-2 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-850/50">
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-300">Villager Name</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedComplaint.villager}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-300">Contact Number</p>
                  <p className="font-mono text-slate-300 mt-0.5">{selectedComplaint.phone}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-300">Location Ward</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedComplaint.ward}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-300">Date Registered</p>
                  <p className="text-slate-300 mt-0.5">{selectedComplaint.date}</p>
                </div>
              </div>

              {/* Audio playback area */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-gray-100">
                    <Volume2 className="w-4 h-4 text-blue-500" />
                    Audio Transcript ({selectedComplaint.audioDuration})
                  </span>
                  <button
                    onClick={(e) => handleAudioToggle(selectedComplaint.id, selectedComplaint.audioDuration, e)}
                    className="py-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all"
                  >
                    {playingAudioId === selectedComplaint.id ? 'Pause Test' : 'Listen Memo'}
                  </button>
                </div>
                <p className="text-xs italic text-gray-305 leading-relaxed font-mono">
                  &quot;{selectedComplaint.voiceTranscript}&quot;
                </p>
              </div>

              {/* Admin update inputs form */}
              <form onSubmit={handleSaveDetailsSubmit} className="space-y-4 text-xs">
                <div className="grid gap-4 grid-cols-2">
                  {/* Status Options */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-200">Current Status</label>
                    <select
                      value={tempStatus}
                      onChange={(e) => setTempStatus(e.target.value as any)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Priority Options */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-200">Moderation Priority</label>
                    <select
                      value={tempPriority}
                      onChange={(e) => setTempPriority(e.target.value as any)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Team Assignment */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-200">Dispatch Team Assignment</label>
                  <input
                    type="text"
                    placeholder="e.g. Water Sanitation Department, Grid Electricians"
                    value={tempTeam}
                    onChange={(e) => setTempTeam(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-gray-400 focus:outline-none"
                  />
                </div>

                {/* Response notes */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-200">Resolution & Audit Action Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about linestaff dispatch, work updates, or rejection explanations..."
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-gray-400 focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                {/* Quick actions box */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-505 text-white font-poppins font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Save Modifications
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEscalate(selectedComplaint.id)}
                    className="py-3 px-4 rounded-xl bg-red-950/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-poppins font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Escalate SOS
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </AdminLayout>
  )
}
