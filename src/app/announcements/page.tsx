'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pin,
  Play,
  Pause,
  Calendar,
  Bell,
  BellOff,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  priority: 'high' | 'medium' | 'low'
  category: 'notice' | 'festival' | 'event'
  isPinned?: boolean
  voiceText: string
}

export default function VillageAnnouncements() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [readAnnouncements, setReadAnnouncements] = React.useState<string[]>(['ANN-4'])
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Audio playback simulator
  const [playingAnnouncementId, setPlayingAnnouncementId] = React.useState<string | null>(null)
  const [playbackProgress, setPlaybackProgress] = React.useState(0)
  
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const handleToggleNotification = () => {
    setNotificationsEnabled(!notificationsEnabled)
  }

  const handlePlayVoice = (ann: Announcement, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // If clicking currently playing
    if (playingAnnouncementId === ann.id) {
      window.speechSynthesis.cancel()
      setPlayingAnnouncementId(null)
      setPlaybackProgress(0)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    // Stop current speech
    window.speechSynthesis.cancel()
    if (timerRef.current) clearInterval(timerRef.current)
    setPlaybackProgress(0)

    // Mark as read
    if (!readAnnouncements.includes(ann.id)) {
      setReadAnnouncements((prev) => [...prev, ann.id])
    }

    // Start mock progression
    setPlayingAnnouncementId(ann.id)
    let progress = 0
    timerRef.current = setInterval(() => {
      progress += 5
      setPlaybackProgress(Math.min(progress, 100))
      if (progress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current)
        setPlayingAnnouncementId(null)
        setPlaybackProgress(0)
      }
    }, 200)

    // Speech API
    const utterance = new SpeechSynthesisUtterance(ann.voiceText)
    utterance.onend = () => {
      setPlayingAnnouncementId(null)
      setPlaybackProgress(0)
      if (timerRef.current) clearInterval(timerRef.current)
    }
    window.speechSynthesis.speak(utterance)
  }

  React.useEffect(() => {
    async function fetchAnnouncements() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const mapped = data.map((item: any) => {
            const dateStr = new Date(item.created_at).toLocaleString()
            const categoryVal = item.category?.toLowerCase() || 'notice'
            
            return {
              id: item.id,
              title: item.title,
              content: item.description || '',
              date: dateStr,
              priority: (item.priority?.toLowerCase() === 'high' || item.priority?.toLowerCase() === 'medium' || item.priority?.toLowerCase() === 'low')
                ? (item.priority.toLowerCase() as 'high' | 'medium' | 'low')
                : 'medium',
              category: (categoryVal === 'notice' || categoryVal === 'festival' || categoryVal === 'event')
                ? (categoryVal as 'notice' | 'festival' | 'event')
                : 'notice',
              isPinned: item.priority?.toLowerCase() === 'high',
              voiceText: item.title + '. ' + (item.description || '')
            }
          })
          setAnnouncements(mapped)
        }
      } catch (err) {
        console.error('Error fetching announcements:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()

    const channel = supabase
      .channel('announcements-citizen-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchAnnouncements()
        }
      )
      .subscribe()

    return () => {
      window.speechSynthesis.cancel()
      if (timerRef.current) clearInterval(timerRef.current)
      supabase.removeChannel(channel)
    }
  }, [])

  const markAllRead = () => {
    const allIds = announcements.map((a) => a.id)
    setReadAnnouncements(allIds)
  }

  const filteredAnnouncements = announcements.filter((ann) => {
    if (activeCategory === 'all') return true
    return ann.category === activeCategory
  })

  // Separate pinned and unpinned
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned)
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Alerts Warnings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-emerald-400">Village Announcements</h1>

        <button
          onClick={handleToggleNotification}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            notificationsEnabled
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-gray-300'
          }`}
          title={notificationsEnabled ? 'Mute Notices' : 'Unmute Notices'}
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Timeline Content */}
      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Categories / Actions */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Feed' },
              { id: 'notice', label: 'Notices' },
              { id: 'event', label: 'Events' },
              { id: 'festival', label: 'Festivals' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeCategory === tab.id
                    ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-300'
                    : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer select-none text-center"
          >
            Mark all as read
          </button>
        </section>

        {loading ? (
          <div className="text-center py-12 text-sm font-semibold text-gray-300">
            Loading announcements from Panchayat...
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-sm font-semibold text-gray-300">
            No announcements available.
          </div>
        ) : (
          <>
            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-red-500" />
                  Pinned Announcements
                </h3>

                <div className="space-y-3">
                  {pinnedAnnouncements.map((ann) => {
                    const isRead = readAnnouncements.includes(ann.id)
                    const isPlaying = playingAnnouncementId === ann.id

                    return (
                      <div
                        key={ann.id}
                        className="p-5 rounded-2xl border-2 border-red-500/25 bg-gradient-to-r from-slate-950 via-slate-900/60 to-red-950/10 backdrop-blur-sm relative space-y-3 shadow-xl"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {!isRead && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
                              Critical Alert
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-305 font-semibold">{ann.date}</span>
                        </div>

                        <h4 className="font-poppins font-bold text-sm sm:text-base text-slate-200">
                          {ann.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                          {ann.content}
                        </p>

                        {/* Audio controller */}
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-900">
                          <button
                            onClick={(e) => handlePlayVoice(ann, e)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                              isPlaying ? 'bg-red-600 text-white' : 'bg-slate-900 text-gray-200 hover:text-white border border-slate-800'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
                          </button>
                          <div className="flex-grow space-y-1">
                            <p className="text-[10px] font-bold text-gray-200">
                              {isPlaying ? 'Broadcasting Voice Notice' : 'Listen Voice Announcement'}
                            </p>
                            <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 transition-all duration-200"
                                style={{ width: `${isPlaying ? playbackProgress : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Timeline Announcements Feed */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Announcement Feed
              </h3>

              <div className="space-y-4">
                {regularAnnouncements.map((ann) => {
                  const isRead = readAnnouncements.includes(ann.id)
                  const isPlaying = playingAnnouncementId === ann.id

                  return (
                    <div
                      key={ann.id}
                      onClick={() => !isRead && setReadAnnouncements((prev) => [...prev, ann.id])}
                      className={`p-5 rounded-2xl border bg-slate-900/30 backdrop-blur-sm relative space-y-3 shadow-md transition-all ${
                        isRead ? 'border-slate-850 opacity-80' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {!isRead && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                              ann.priority === 'high'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : ann.priority === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : 'bg-slate-800 text-gray-200'
                            }`}
                          >
                            {ann.priority} Priority
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-305 font-semibold">{ann.date}</span>
                      </div>

                      <h4 className="font-poppins font-bold text-sm sm:text-base text-slate-200">
                        {ann.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                        {ann.content}
                      </p>

                      {/* Audio controller */}
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-900/50">
                        <button
                          onClick={(e) => handlePlayVoice(ann, e)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                            isPlaying ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-gray-200 hover:text-white border border-slate-900'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
                        </button>
                        <div className="flex-grow space-y-1">
                          <p className="text-[10px] font-bold text-gray-200">
                            {isPlaying ? 'Broadcasting Voice' : 'Listen Voice Announcement'}
                          </p>
                          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-200"
                              style={{ width: `${isPlaying ? playbackProgress : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
