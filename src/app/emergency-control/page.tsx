'use client'

import * as React from 'react'
import { AdminLayout } from '../../components/admin-layout'
import {
  AlertOctagon,
  Clock,
  Phone,
  Play,
  Pause,
  MapPin,
  ShieldAlert,
  CheckCircle,
  Volume2,
  Truck
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface EmergencySOS {
  id: string
  villager: string
  phone: string
  ward: string
  locationDetails: string
  timestamp: string
  severity: 'high' | 'critical'
  status: 'active' | 'dispatched' | 'resolved'
  audioDuration: string
  voiceTranscript: string
  dispatchedUnit?: 'ambulance' | 'police' | 'local-clinic' | 'none'
}

export default function EmergencyControl() {
  const [emergencies, setEmergencies] = React.useState<EmergencySOS[]>([])
  const [loading, setLoading] = React.useState(true)
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null)

  const loadEmergencies = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*, users(*)')
        .order('created_at', { ascending: false })
      if (error) throw error

      if (data) {
        const mapped: EmergencySOS[] = data.map((sos: any) => {
          const dbStatus = sos.status || 'Active'
          let statusVal: 'active' | 'dispatched' | 'resolved' = 'active'
          let dispatchedUnitVal: 'ambulance' | 'police' | 'local-clinic' | 'none' = 'none'

          if (dbStatus === 'Resolved') {
            statusVal = 'resolved'
          } else if (dbStatus.startsWith('Dispatched') || dbStatus.startsWith('Responding')) {
            statusVal = 'dispatched'
            const parts = dbStatus.split(':')
            if (parts.length > 1) {
              const u = parts[1].trim().toLowerCase()
              if (u === 'ambulance' || u === 'police' || u === 'local-clinic') {
                dispatchedUnitVal = u as any
              }
            }
          }

          const isCritical = sos.emergency_type?.toLowerCase().includes('fire') || 
                            sos.emergency_type?.toLowerCase().includes('medical') || 
                            sos.emergency_type?.toLowerCase().includes('police') ||
                            sos.emergency_type?.toLowerCase().includes('critical')

          return {
            id: sos.id,
            villager: sos.users?.name || 'Citizen',
            phone: sos.users?.phone || 'No phone',
            ward: sos.users?.address || 'Ward 3',
            locationDetails: sos.emergency_type || 'General SOS Alert',
            timestamp: new Date(sos.created_at).toLocaleTimeString() + ' (' + new Date(sos.created_at).toLocaleDateString() + ')',
            severity: isCritical ? 'critical' : 'high',
            status: statusVal,
            audioDuration: '0:15',
            voiceTranscript: `Logged an emergency alert for ${sos.emergency_type || 'General SOS'}.`,
            dispatchedUnit: dispatchedUnitVal
          }
        })
        setEmergencies(mapped)
      }
    } catch (err) {
      console.error('Error fetching emergencies:', err)
      toast.error('Failed to load emergencies.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadEmergencies()

    const channel = supabase
      .channel('emergency-alerts-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts'
        },
        () => {
          loadEmergencies()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAudioToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingAudioId === id) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(id)
      setTimeout(() => setPlayingAudioId(null), 5000)
    }
  }

  const handleDispatchUnit = async (id: string, unit: 'ambulance' | 'police' | 'local-clinic') => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ status: `Dispatched: ${unit}` })
        .eq('id', id)
      
      if (error) throw error

      setEmergencies(prev =>
        prev.map(sos =>
          sos.id === id
            ? {
                ...sos,
                status: 'dispatched',
                dispatchedUnit: unit
              }
            : sos
        )
      )
      toast.success(`Emergency unit [${unit.toUpperCase()}] dispatched successfully.`)
    } catch (err) {
      console.error('Error dispatching unit:', err)
      toast.error('Failed to dispatch emergency unit.')
    }
  }

  const handleResolveEmergency = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ status: 'Resolved' })
        .eq('id', id)
      
      if (error) throw error

      setEmergencies(prev =>
        prev.map(sos =>
          sos.id === id
            ? {
                ...sos,
                status: 'resolved',
                dispatchedUnit: 'none'
              }
            : sos
        )
      )
      toast.success(`Emergency ID: ${id} marked as resolved.`)
    } catch (err) {
      console.error('Error resolving emergency:', err)
      toast.error('Failed to resolve emergency.')
    }
  }

  return (
    <AdminLayout title="Emergency Response Control Desk">
      {/* Active High-Alert SOS Indicator */}
      {emergencies.some(sos => sos.status === 'active') && (
        <section className="p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-red-900/30 to-slate-900 border-2 border-red-500/20 text-red-400 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/25 rounded-xl border border-red-500/35 text-red-400 shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-poppins font-extrabold text-base leading-tight">ACTIVE CRITICAL EMERGENCY ALERT</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Active SOS triggers logged from mobile client near Panchayat Well. Audio record indicates snapped high voltage power line.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-400 shrink-0">
            Immediate Dispatch Required
          </div>
        </section>
      )}

      {/* Grid of Emergency Cards */}
      {loading ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-slate-500 text-xs font-semibold">
          Loading SOS registry from Panchayat...
        </div>
      ) : emergencies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {emergencies.map((sos) => {
            const isActive = sos.status === 'active'
            const isDispatched = sos.status === 'dispatched'
            const isCritical = sos.severity === 'critical'
            const isPlaying = playingAudioId === sos.id

            return (
              <div
                key={sos.id}
                className={`p-5 rounded-3xl border-2 bg-slate-950/40 backdrop-blur-sm shadow-xl flex flex-col justify-between gap-5 relative transition-all ${
                  isActive 
                    ? 'border-red-500/30 shadow-red-500/5' 
                    : isDispatched
                    ? 'border-blue-500/25 shadow-blue-500/5'
                    : 'border-slate-850'
                }`}
              >
                {/* Header metadata */}
                <div className="flex items-start justify-between gap-3 text-[10px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isCritical 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                      {sos.severity} Alert
                    </span>

                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      ID: {sos.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500 font-mono">{sos.timestamp}</span>
                  </div>
                </div>

                {/* Villager credentials */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                      🚨
                    </div>
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-slate-200">
                        {sos.villager} ({sos.ward})
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {sos.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-slate-400 bg-slate-900/30 p-3 rounded-xl border border-slate-900/40">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-300">Shared Coordinates / Location:</p>
                      <p className="mt-0.5 text-[11px]">{sos.locationDetails}</p>
                    </div>
                  </div>
                </div>

                {/* Voice Record audio controls */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-bold text-slate-350">
                      <Volume2 className="w-4 h-4 text-red-400" />
                      Incoming SOS Audio Memo ({sos.audioDuration})
                    </span>
                    <button
                      onClick={(e) => handleAudioToggle(sos.id, e)}
                      className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 pl-0.5" />}
                    </button>
                  </div>
                  <p className="text-xs italic text-slate-400 leading-relaxed font-mono">
                    &quot;{sos.voiceTranscript}&quot;
                  </p>
                </div>

                {/* Responder dispatcher UI actions */}
                <div className="border-t border-slate-900 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border ${
                    isActive 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : isDispatched
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {sos.status}
                  </span>

                  {isActive && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDispatchUnit(sos.id, 'ambulance')}
                        className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-poppins font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-red-500/10"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Send Ambulance
                      </button>
                      <button
                        onClick={() => handleDispatchUnit(sos.id, 'police')}
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-poppins font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Send Police
                      </button>
                    </div>
                  )}

                  {isDispatched && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-450 italic font-medium">
                        Dispatched: {sos.dispatchedUnit?.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleResolveEmergency(sos.id)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-poppins font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-emerald-500/10"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-slate-500 text-xs font-semibold">
          No emergency alerts recorded.
        </div>
      )}
    </AdminLayout>
  )
}
