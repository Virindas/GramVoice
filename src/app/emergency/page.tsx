'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  PhoneCall,
  MapPin,
  AlertTriangle,
  Volume2,
  Users,
  Building,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser, UserSession } from '../../lib/auth'

export default function EmergencySOS() {
  const navigate = useNavigate()
  const [triggerState, setTriggerState] = React.useState<'idle' | 'countdown' | 'calling'>('idle')
  const [countdown, setCountdown] = React.useState(3)
  const [callingContact, setCallingContact] = React.useState<string | null>(null)
  const [activeAlerts, setActiveAlerts] = React.useState<any[]>([])
  const [user, setUser] = React.useState<UserSession | null>(null)

  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const loadActiveAlerts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'Resolved')
        .order('created_at', { ascending: false })
      if (error) throw error
      setActiveAlerts(data || [])
    } catch (err) {
      console.error('Error loading active alerts:', err)
    }
  }

  React.useEffect(() => {
    const session = getUser()
    if (!session) {
      navigate('/login')
      return
    }
    setUser(session)

    const userId = session.id
    loadActiveAlerts(userId)

    const channel = supabase
      .channel(`user-emergency-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadActiveAlerts(userId)
        }
      )
      .subscribe()

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      supabase.removeChannel(channel)
    }
  }, [navigate])

  const saveEmergencyAlert = async (contactName: string) => {
    const session = getUser()
    if (!session) return

    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .insert([{
          user_id: session.id,
          emergency_type: contactName || 'General SOS',
          status: 'Active'
        }])
      if (error) throw error
    } catch (err) {
      console.error('Error logging SOS alert to Supabase:', err)
    }
  }

  const handleResolveSOS = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ status: 'Resolved' })
        .eq('id', alertId)
      if (error) throw error
      
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (err) {
      console.error('Error resolving alert:', err)
      alert('Failed to resolve SOS alert. Please try again.')
    }
  }

  const startSOS = () => {
    setTriggerState('countdown')
    setCountdown(3)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          setTriggerState('calling')
          setCallingContact('North Village Pradhan Office')
          saveEmergencyAlert('General SOS')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const cancelSOS = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setTriggerState('idle')
    setCountdown(3)
  }

  const triggerCallDirect = (contactName: string) => {
    setTriggerState('calling')
    setCallingContact(contactName)
    saveEmergencyAlert(contactName)
  }

  const endCall = () => {
    setTriggerState('idle')
    setCallingContact(null)
  }

  const emergencyContacts = [
    { name: 'Panchayat Pradhan Office', role: 'Village Leader', phone: '+91 98765 43210', icon: Users },
    { name: 'Primary Health Center (Ambulance)', role: 'Medical Emergency', phone: '+91 98765 43211', icon: PhoneCall },
    { name: 'Local Police Station (North Sector)', role: 'Law Enforcement', phone: '+91 98765 43212', icon: Building },
    { name: 'Fire Response Department', role: 'Fire Safety', phone: '+91 98765 43213', icon: AlertTriangle },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Alerts Warnings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-125 h-125 bg-red-600/5 rounded-full blur-3xl" />
        {triggerState === 'calling' && (
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/villager-dashboard')}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-sm">Dashboard</span>
        </button>

        <h1 className="font-poppins font-bold text-lg text-red-600">Emergency Response Portal</h1>

        <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center">
          🚨
        </div>
      </header>

      {/* Main SOS panel */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col justify-center gap-8 relative z-10">
        {/* GPS location badge */}
        <section className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-md">
            <MapPin className="w-4 h-4 text-red-500 animate-bounce" />
            <span>Sharing live location: North Village (Panchayat Ward 3)</span>
          </div>
        </section>

        {/* Large panic button */}
        <section className="flex flex-col items-center justify-center gap-6">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Pulsing warning waves */}
            <AnimatePresence>
              {triggerState === 'idle' && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-red-500 bg-red-500/5 pointer-events-none"
                />
              )}
              {triggerState === 'countdown' && (
                <motion.div
                  animate={{ scale: [1, 1.6, 1], rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-red-500"
                />
              )}
            </AnimatePresence>

            {/* Inner Panic Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={triggerState === 'idle' ? startSOS : triggerState === 'countdown' ? cancelSOS : undefined}
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl relative z-10 cursor-pointer ${
                triggerState === 'countdown'
                  ? 'bg-linear-to-br from-white to-slate-100 border-2 border-red-500 text-red-600 shadow-red-500/10'
                  : triggerState === 'calling'
                  ? 'bg-linear-to-br from-red-600 to-red-800 text-white shadow-red-500/30 animate-pulse'
                  : 'bg-linear-to-br from-red-500 to-red-700 text-white shadow-red-500/30'
              }`}
            >
              {triggerState === 'countdown' ? (
                <>
                  <h2 className="text-5xl font-mono font-extrabold">{countdown}</h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Tap to Cancel</span>
                </>
              ) : triggerState === 'calling' ? (
                <>
                  <PhoneCall className="w-14 h-14 animate-bounce" />
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Active Call</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-14 h-14 animate-pulse text-white" />
                  <span className="text-sm uppercase font-extrabold tracking-widest mt-2 text-white">Press SOS</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="text-center space-y-1 text-slate-700">
            {triggerState === 'countdown' ? (
              <h3 className="font-poppins font-bold text-sm text-red-500">
                Triggering Panchayat Alert in {countdown}s...
              </h3>
            ) : triggerState === 'calling' ? (
              <h3 className="font-poppins font-bold text-sm text-red-600 animate-pulse">
                Auto-Calling Live Emergency Services
              </h3>
            ) : (
              <h3 className="font-poppins font-bold text-sm text-slate-700">
                Tap button to notify village administration immediately
              </h3>
            )}
          </div>
        </section>

        {activeAlerts.length > 0 && (
          <section className="space-y-3 bg-red-500/15 border-2 border-red-500/20 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Active SOS Alarms ({activeAlerts.length})
              </h3>
              <span className="animate-ping w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>

            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const dbStatus = alert.status || 'Active'
                let isDispatched = false
                let dispatchedUnit = ''

                if (dbStatus.startsWith('Dispatched') || dbStatus.startsWith('Responding')) {
                  isDispatched = true
                  const parts = dbStatus.split(':')
                  if (parts.length > 1) {
                    dispatchedUnit = parts[1].trim()
                  }
                }

                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl border border-red-500/10 bg-white/80 dark:bg-slate-900/80 shadow-md flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 text-slate-700 dark:text-slate-355">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Type: {alert.emergency_type}
                      </p>
                      <p className="text-[10px] text-gray-305 dark:text-gray-200 font-mono">
                        Time: {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                      {isDispatched ? (
                        <p className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 mt-1 animate-pulse">
                          <span>🚀 En Route:</span>
                          <span className="uppercase">{dispatchedUnit} Dispatched</span>
                        </p>
                      ) : (
                        <p className="text-red-500 font-semibold mt-1">
                          Awaiting Panchayat dispatcher unit...
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleResolveSOS(alert.id)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-poppins font-bold text-[10px] cursor-pointer transition-colors shadow-md shadow-emerald-500/10"
                    >
                      Mark Safe
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Emergency Contacts grid */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 text-center sm:text-left">
            Quick Emergency Contacts
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {emergencyContacts.map((contact, idx) => (
              <div
                key={idx}
                onClick={() => triggerCallDirect(contact.name)}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-500/20 hover:bg-red-500/5 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <contact.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-sm text-slate-700 leading-tight">
                      {contact.name}
                    </h4>
                    <p className="text-[10px] text-slate-700 mt-0.5">{contact.role}</p>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-red-500 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Simulated Call Active Modal */}
      <AnimatePresence>
        {triggerState === 'calling' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-md w-full">
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full bg-red-600/10 border-2 border-red-500/30 mx-auto flex items-center justify-center">
                  <PhoneCall className="w-10 h-10 text-red-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-poppins font-extrabold text-slate-800">
                    Simulating Emergency Call
                  </h2>
                  <p className="text-sm text-red-600 font-semibold">{callingContact}</p>
                  <p className="text-xs text-slate-700 mt-2">
                    GPS Coordinates: 13.0827° N, 80.2707° E
                  </p>
                </div>
              </div>

              {/* simulated calling dots */}
              <div className="flex gap-2 justify-center py-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-red-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-3 text-left shadow-sm">
                <Volume2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-bold text-slate-800">AI Voice Assistant Active:</p>
                  <p>
                    &quot;Broadcasting SOS to Panchayat: {user?.name || 'Citizen'} requires medical support at {user?.address || 'Ward 3'}...&quot;
                  </p>
                </div>
              </div>

              <button
                onClick={endCall}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-poppins font-bold shadow-lg shadow-red-500/20 cursor-pointer"
              >
                End Emergency Call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
