'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mic,
  MicOff,
  CheckCircle,
  History,
  Lightbulb,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

interface ServiceRequestTicket {
  id: string
  category: string
  date: string
  status: 'registered' | 'dispatched' | 'resolved'
  description: string
  voiceNote: boolean
}

export default function ServiceRequest() {
  const navigate = useNavigate()
  
  // Requests Categories
  const requestTypes = [
    { id: 'water', label: 'Request Water Tanker', icon: '🚰', desc: 'Dispatches public drinking water tankers to wards.' },
    { id: 'road', label: 'Request Road Patching', icon: '🛣️', desc: 'Reports potholes and broken side-walks.' },
    { id: 'waste', label: 'Request Waste Cleanup', icon: '🧹', desc: 'Alerts garbage truck crews for backlog trash.' },
    { id: 'light', label: 'Request Streetlight Repair', icon: '💡', desc: 'Reports fused bulbs on village lampposts.' },
    { id: 'agri', label: 'Agriculture Tech Support', icon: '🚜', desc: 'Requests soil inspection or seed subsidy advice.' },
  ]

  // States
  const [selectedType, setSelectedType] = React.useState('water')
  const [requestText, setRequestText] = React.useState('')
  const [recordingState, setRecordingState] = React.useState<'idle' | 'recording' | 'finished'>('idle')
  const [seconds, setSeconds] = React.useState(0)
  const [waveHeights, setWaveHeights] = React.useState<number[]>(Array(10).fill(10))
  const [tickets, setTickets] = React.useState<ServiceRequestTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<any>(null)

  // Modals
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const waveRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecord = () => {
    setRecordingState('recording')
    setSeconds(0)
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    waveRef.current = setInterval(() => {
      setWaveHeights(Array.from({ length: 10 }, () => Math.floor(Math.random() * 35) + 8))
    }, 120)
  }

  const stopRecord = () => {
    setRecordingState('finished')
    if (timerRef.current) clearInterval(timerRef.current)
    if (waveRef.current) clearInterval(waveRef.current)
    setWaveHeights(Array(10).fill(10))

    // Set voice text
    if (!requestText.trim()) {
      const mockNote = `Requesting immediate service for: ${requestTypes.find(t => t.id === selectedType)?.label}. Leakage/issue is visible near my house.`
      setRequestText(mockNote)
    }
  }

  const handleRetryRecord = () => {
    setRecordingState('idle')
    setSeconds(0)
    setRequestText('')
  }

  React.useEffect(() => {
    const session = getUser()
    if (!session) {
      navigate('/login')
      return
    }
    setUser(session)

    const userId = session.id

    async function loadTickets() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const mapped = data.map((item: any) => {
            let statusVal: 'registered' | 'dispatched' | 'resolved' = 'registered'
            const dbStatus = item.status?.toLowerCase()
            if (dbStatus === 'resolved') {
              statusVal = 'resolved'
            } else if (dbStatus === 'dispatched' || dbStatus === 'in progress' || dbStatus === 'in-progress') {
              statusVal = 'dispatched'
            }
            return {
              id: item.id,
              category: item.type || 'General Request',
              date: new Date(item.created_at).toLocaleString(),
              status: statusVal,
              description: item.description || '',
              voiceNote: false
            }
          })
          setTickets(mapped)
        }
      } catch (err) {
        console.error('Error loading service requests:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()

    const channel = supabase
      .channel(`user-service-requests-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadTickets()
        }
      )
      .subscribe()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveRef.current) clearInterval(waveRef.current)
      supabase.removeChannel(channel)
    }
  }, [navigate])

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestText.trim() && recordingState !== 'finished') return

    const label = requestTypes.find((t) => t.id === selectedType)?.label || 'General Request'
    const desc = requestText || `Requesting immediate service for: ${label}`

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          user_id: user?.id,
          type: label,
          description: desc,
          status: 'Pending'
        }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        const newTicket: ServiceRequestTicket = {
          id: data.id,
          category: data.type || label,
          date: 'Just Now',
          status: 'registered',
          description: data.description || desc,
          voiceNote: recordingState === 'finished',
        }

        setTickets((prev) => [newTicket, ...prev])
        setShowSuccessModal(true)
      }
    } catch (err) {
      console.error('Error submitting service request:', err)
      alert('Failed to submit request. Please try again.')
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
    setRequestText('')
    setRecordingState('idle')
    setSeconds(0)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-90 h-90 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-85 h-85 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/villager-dashboard')}
          className="p-2 text-gray-200 hover:text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-sm">Dashboard</span>
        </button>

        <h1 className="font-poppins font-bold text-lg text-purple-400">Request Panchayat Services</h1>

        <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
          🛠️
        </div>
      </header>

      {/* Main Request Form */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 grid gap-6 md:grid-cols-12 relative z-10">
        
        {/* Left: Input Request forms */}
        <section className="md:col-span-7 space-y-5">
          <form onSubmit={handleSubmitRequest} className="p-5 sm:p-6 rounded-3xl border border-slate-850 bg-slate-900/40 space-y-5 shadow-md">
            
            {/* 1. Request Type Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-200">
                1. Select Service Action
              </label>
              <div className="grid gap-2">
                {requestTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                        : 'border-slate-850 bg-slate-950/40 text-gray-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">{type.icon}</span>
                      <div>
                        <h4 className="font-poppins font-bold text-xs sm:text-sm leading-tight">{type.label}</h4>
                        <p className="text-[10px] text-gray-300 mt-0.5">{type.desc}</p>
                      </div>
                    </div>
                    {selectedType === type.id && <span className="text-purple-400">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Voice Recorder block */}
            <div className="space-y-3.5 pt-2 border-t border-slate-850/50">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-200">
                2. Explain Problem details
              </label>

              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-850 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={recordingState === 'recording' ? stopRecord : startRecord}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg cursor-pointer ${
                      recordingState === 'recording'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {recordingState === 'recording' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <div className="flex-grow space-y-1 pr-4">
                    <p className="text-xs font-bold text-gray-250">
                      {recordingState === 'recording'
                        ? `Recording Voice... (${seconds}s)`
                        : recordingState === 'finished'
                        ? 'Voice Note Ready'
                        : 'Tap mic to explain in your language'}
                    </p>
                    {/* Waves */}
                    <div className="flex items-center gap-1 h-6">
                      {waveHeights.map((h, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${h}px` }}
                          className={`w-1 rounded-full ${recordingState === 'recording' ? 'bg-red-500' : 'bg-slate-850'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {recordingState !== 'idle' && (
                  <button
                    type="button"
                    onClick={handleRetryRecord}
                    className="text-[10px] font-bold text-gray-250 hover:text-white cursor-pointer select-none"
                  >
                    Discard & Retry Voice note
                  </button>
                )}
              </div>

              {/* Text Area */}
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Write request details here or explain via voice above..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-poppins font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              Submit Request Ticket
            </button>

          </form>
        </section>

        {/* Right: Request History */}
        <section className="md:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5 pb-2 border-b border-slate-900">
              <History className="w-4 h-4 text-purple-500" />
              Service Requests History ({tickets.length})
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-xs text-slate-300 font-semibold">
                  Loading request history...
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-300 font-semibold">
                  No previous service requests.
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-purple-400 font-mono">{t.id}</span>
                        <h4 className="font-poppins font-bold text-slate-200 mt-0.5">{t.category}</h4>
                      </div>

                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : t.status === 'dispatched'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 italic">
                      &quot;{t.description}&quot;
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-300 font-semibold border-t border-slate-900/50 pt-2">
                      <span>{t.date}</span>
                      {t.voiceNote && <span className="text-[10px] text-purple-400">🎤 Voice Attached</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/10 flex gap-2.5 text-xs text-slate-200">
            <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p>
              Requested tickets are automatically matched with local volunteers. Water tankers are usually dispatched within 2 hours.
            </p>
          </div>
        </section>

      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
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
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-poppins font-bold text-base text-slate-200">Request Registered!</h4>
                <p className="text-xs text-slate-200">
                  Your ticket has been dispatched to Panchayat Volunteers.
                </p>
                <p className="text-xs text-slate-300 px-4 mt-2">
                  Linemen and tankers will receive alerts with your Ward 3 address. You will receive notification logs on updates.
                </p>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-poppins font-bold text-xs cursor-pointer transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
