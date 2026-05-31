'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Volume2,
  VolumeX,
  Users,
  MapPin,
  Clock,
  Check,
} from 'lucide-react'

interface VillageEvent {
  id: string
  title: string
  category: 'festival' | 'meeting' | 'health' | 'agri'
  date: string
  time: string
  location: string
  countdownDays: number
  description: string
  rsvps: number
  imgPlaceholder: string
}

const EVENTS_DATA: VillageEvent[] = [
  {
    id: 'evt-1',
    title: 'Ganesha Temple Annual Chariot Festival',
    category: 'festival',
    date: 'June 05, 2026',
    time: '08:00 AM onwards',
    location: 'Central Bazar Temple Ground',
    countdownDays: 6,
    description: 'Devotional programs, traditional music performances, and community lunch. All wards invited.',
    rsvps: 184,
    imgPlaceholder: '🌸 Temple Puja & Chariot decoration',
  },
  {
    id: 'evt-2',
    title: 'Monthly Grama Sabha Review Meeting',
    category: 'meeting',
    date: 'June 10, 2026',
    time: '10:00 AM - 01:00 PM',
    location: 'Panchayat Community Hall',
    countdownDays: 11,
    description: 'Review of drinking water pipelines and approval of solar streetlight installations.',
    rsvps: 52,
    imgPlaceholder: '📋 Panchayat Pradhan & Ward officers chair',
  },
  {
    id: 'evt-3',
    title: 'Free Cattle Health Checkup & Vaccination',
    category: 'health',
    date: 'June 12, 2026',
    time: '09:00 AM - 03:00 PM',
    location: 'Veterinary Clinic Near Lake Road',
    countdownDays: 13,
    description: 'Specialists visiting from district hospital. Vaccinate cattle against local viral infections.',
    rsvps: 29,
    imgPlaceholder: '🚜 Cooperative dairy veterinary booths',
  },
]

export default function CommunityEvents() {
  const navigate = useNavigate()
  const [userRsvps, setUserRsvps] = React.useState<string[]>([])
  const [speakingEventId, setSpeakingEventId] = React.useState<string | null>(null)

  const handleToggleRsvp = (id: string) => {
    setUserRsvps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSpeakEvent = (evt: VillageEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    if (speakingEventId === evt.id) {
      window.speechSynthesis.cancel()
      setSpeakingEventId(null)
      return
    }

    window.speechSynthesis.cancel()
    const text = `Event: ${evt.title}. Location: ${evt.location}. Date: ${evt.date}. Details: ${evt.description}`
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.onend = () => {
      setSpeakingEventId(null)
    }
    utterance.onerror = () => {
      setSpeakingEventId(null)
    }

    setSpeakingEventId(evt.id)
    window.speechSynthesis.speak(utterance)
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-90 h-90 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/villager-dashboard')}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-sm">Dashboard</span>
        </button>

        <h1 className="font-poppins font-bold text-lg text-emerald-400">Village Events & Fairs</h1>

        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
          🎪
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Timeline Header Card */}
        <section className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm space-y-2 text-center">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">Village Assembly Board</p>
          <h2 className="text-xl sm:text-2xl font-poppins font-extrabold tracking-tight text-slate-200">
            Upcoming Community Gatherings
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Stay updated with seasonal festivals, farmer workshops, and Panchayat audit discussions.
          </p>
        </section>

        {/* Timeline Event Cards */}
        <section className="space-y-4">
          {EVENTS_DATA.map((evt) => {
            const hasRsvped = userRsvps.includes(evt.id)
            const isSpeaking = speakingEventId === evt.id

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between gap-5 relative group"
              >
                {/* Event Core details */}
                <div className="space-y-3.5">
                  
                  {/* Category and Audio buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-wider">
                      <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded">
                        {evt.category}
                      </span>
                      <span className="bg-slate-950 text-slate-500 px-2 py-0.5 rounded font-mono">
                        {evt.countdownDays} Days Left
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleSpeakEvent(evt, e)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-red-500/10 border-red-500 text-red-400'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-poppins font-bold text-slate-200 leading-tight">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                    {evt.description}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {evt.time}
                    </span>
                    <span className="flex items-center gap-1 sm:col-span-1">
                      <MapPin className="w-3.5 h-3.5 text-pink-500" />
                      {evt.location}
                    </span>
                  </div>
                </div>

                {/* Event mock gallery banner */}
                <div className="h-14 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-[10px] text-slate-600 font-semibold italic">
                  {evt.imgPlaceholder}
                </div>

                {/* RSVP action buttons */}
                <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-xs">
                  <span className="flex items-center gap-1 font-bold text-slate-400">
                    <Users className="w-4 h-4 text-emerald-500" />
                    {evt.rsvps + (hasRsvped ? 1 : 0)} Citizens Attending
                  </span>

                  <button
                    onClick={() => handleToggleRsvp(evt.id)}
                    className={`py-2 px-4 rounded-xl font-poppins font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                      hasRsvped
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750'
                    }`}
                  >
                    {hasRsvped ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        RSVP Confirmed
                      </>
                    ) : (
                      'I Will Attend (RSVP)'
                    )}
                  </button>
                </div>

              </motion.div>
            )
          })}
        </section>
      </main>
    </div>
  )
}
