'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'
import {
  Mic,
  Calendar,
  AlertTriangle,
  History,
  Volume2,
  X,
  MessageSquare,
  Home,
  FileText,
  User,
  BookOpen,
  Phone,
  Wrench,
  HelpCircle,
  Award,
  Activity,
  FolderOpen,
  Sliders,
  Megaphone,
} from 'lucide-react'

export default function VillagerDashboard() {
  const navigate = useNavigate()
  const [lang, setLang] = React.useState('en')
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false)
  const [assistantText, setAssistantText] = React.useState('')
  const [chatLog, setChatLog] = React.useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your GramVoice helper. Speak or type your request.' },
  ])

  // Custom audio playback demo state
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [recentComplaints, setRecentComplaints] = React.useState<any[]>([])
  const [announcementsCount, setAnnouncementsCount] = React.useState(0)

  React.useEffect(() => {
    const session = getUser()
    if (!session) {
      navigate('/login')
      return
    }
    setUser(session)

    if (session.language === 'हिन्दी') {
      setLang('hi')
    } else if (session.language === 'தமிழ்') {
      setLang('ta')
    } else {
      setLang('en')
    }

    const userId = session.id

    async function loadRecent() {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (error) throw error
        setRecentComplaints(data || [])
      } catch (err) {
        console.error('Error fetching recent complaints:', err)
      }
    }

    async function loadAnnouncementsCount() {
      try {
        const { count, error } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
        if (error) throw error
        setAnnouncementsCount(count || 0)
      } catch (err) {
        console.error('Error fetching announcements count:', err)
      }
    }

    loadRecent()
    loadAnnouncementsCount()

    // Subscribe to complaints updates for user
    const complaintsChannel = supabase
      .channel(`user-dashboard-complaints-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadRecent()
        }
      )
      .subscribe()

    // Subscribe to announcements updates
    const announcementsChannel = supabase
      .channel('user-dashboard-announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          loadAnnouncementsCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(complaintsChannel)
      supabase.removeChannel(announcementsChannel)
    }
  }, [navigate])

  const handleAudioPlay = async () => {
    setIsPlayingAudio(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      let text = "Welcome to GramVoice. You have no new announcements today."
      if (!error && data) {
        text = `Attention villagers. New announcement: ${data.title}. ${data.description || ''}`
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.error(e)
      setIsPlayingAudio(false)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assistantText.trim()) return

    const newLog = [...chatLog, { sender: 'user', text: assistantText } as const]
    setChatLog(newLog)
    setAssistantText('')

    // Generate mock AI response
    setTimeout(() => {
      setChatLog([
        ...newLog,
        {
          sender: 'ai',
          text: 'I understand you are asking about local services. You can tap "Record Complaint" to register any official issue directly via voice.',
        },
      ])
    }, 1000)
  }

  const translations = {
    en: {
      welcome: 'Welcome, Citizen',
      tagline: 'North Village (Ward 3)',
      recordTitle: 'Record Voice Complaint',
      recordDesc: 'Speak your issue directly to Panchayat in your language.',
      trackTitle: 'Track Complaints',
      trackDesc: 'Check status, timelines and resolution updates.',
      sosTitle: 'Emergency SOS',
      sosDesc: 'Request immediate support from village emergency contacts.',
      schemesTitle: 'Government Schemes',
      schemesDesc: 'Check eligibility for PM-Kisan and housing schemes.',
      recentTitle: 'Recent Submissions',
      listenUpdates: 'Listen to updates',
    },
    hi: {
      welcome: 'स्वागत है, नागरिक',
      tagline: 'उत्तरी गाँव (वार्ड 3)',
      recordTitle: 'शिकायत दर्ज करें',
      recordDesc: 'अपनी भाषा में पंचायत को सीधे अपनी समस्या बताएं।',
      trackTitle: 'शिकायत ट्रैक करें',
      trackDesc: 'अपनी शिकायतों की स्थिति और समाधान की जांच करें।',
      sosTitle: 'आपातकालीन एसओएस',
      sosDesc: 'गाँव के आपातकालीन संपर्कों से तुरंत सहायता प्राप्त करें।',
      schemesTitle: 'सरकारी योजनाएं',
      schemesDesc: 'पीएम-किसान और ग्रामीण आवास की पात्रता जांचें।',
      recentTitle: 'हाल ही में सबमिट किया गया',
      listenUpdates: 'अपडेट सुनें',
    },
    ta: {
      welcome: 'வரவேற்கிறோம், குடிமகன்',
      tagline: 'வடக்கு கிராமம் (வார்டு 3)',
      recordTitle: 'குரல் புகார் பதிவு செய்க',
      recordDesc: 'உங்கள் மொழியில் பஞ்சாயத்திற்கு நேரடியாக புகாரை தெரிவிக்கவும்.',
      trackTitle: 'புகார் நிலவரம்',
      trackDesc: 'நிலை, காலக்கெடு மற்றும் தீர்வு நிலவரங்களை சரிபார்க்கவும்.',
      sosTitle: 'அவசர SOS',
      sosDesc: 'கிராம அவசர தொடர்புகளிடம் இருந்து உடனடியாக உதவி பெறுக.',
      schemesTitle: 'அரசு திட்டங்கள்',
      schemesDesc: 'பி.எம்-கிசான் மற்றும் வீட்டு வசதி திட்ட தகுதியை சரிபார்க்க.',
      recentTitle: 'சமீபத்திய புகார்கள்',
      listenUpdates: 'புதிய செய்திகள் கேட்க',
    },
  }[lang] || {
    welcome: 'Welcome, Citizen',
    tagline: 'North Village (Ward 3)',
    recordTitle: 'Record Voice Complaint',
    recordDesc: 'Speak your issue directly to Panchayat in your language.',
    trackTitle: 'Track Complaints',
    trackDesc: 'Check status, timelines and resolution updates.',
    sosTitle: 'Emergency SOS',
    sosDesc: 'Request immediate support from village emergency contacts.',
    schemesTitle: 'Government Schemes',
    schemesDesc: 'Check eligibility for PM-Kisan and housing schemes.',
    recentTitle: 'Recent Submissions',
    listenUpdates: 'Listen to updates',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20 font-sans text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-950/70 border-b border-emerald-500/10 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
              G
            </div>
            <div>
              <h1 className="font-poppins font-bold text-lg leading-tight">GramVoice</h1>
              <p className="text-xs text-muted-foreground font-medium">AI Smart Village Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-lg border-2 border-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all bg-white dark:bg-slate-900 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-600/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <p className="text-emerald-50 text-xs sm:text-sm font-bold uppercase tracking-wider">
              {user?.address || "Village address unavailable"}
            </p>
            <h2 className="text-2xl sm:text-4xl font-poppins font-extrabold tracking-tight">
              {lang === 'hi' 
                ? `स्वागत है, ${user?.name || 'नागरिक'}` 
                : lang === 'ta' 
                ? `வரவேற்கிறோம், ${user?.name || 'குடிமகன்'}` 
                : `Welcome, ${user?.name || 'Citizen'}`}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-emerald-50 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Today: {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'hi' ? 'hi-IN' : 'ta-IN')}</span>
              </div>
              <span>•</span>
              <span className="capitalize">Role: {user?.role}</span>
              <span>•</span>
              <span>Language: {user?.language}</span>
            </div>
          </div>

          {/* Voice News Update button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAudioPlay}
            className="flex items-center gap-3 bg-white text-emerald-700 px-5 py-3 rounded-2xl font-poppins font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer relative z-10"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce text-emerald-500' : ''}`} />
            <span>{isPlayingAudio ? 'Playing...' : translations.listenUpdates}</span>
          </motion.button>
        </section>

        {/* Feature Grid */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* CTA 1: Record Complaint */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl border-2 border-emerald-500/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-md flex flex-col justify-between gap-6 cursor-pointer group"
            onClick={() => navigate('/record-complaint')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                🎤
              </div>
              <h3 className="text-xl font-poppins font-semibold text-foreground leading-tight">
                {translations.recordTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {translations.recordDesc}
              </p>
            </div>
            <div className="flex items-center text-emerald-500 font-bold text-sm">
              Start recording →
            </div>
          </motion.div>

          {/* CTA 2: Track Complaint */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl border-2 border-emerald-500/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-md flex flex-col justify-between gap-6 cursor-pointer group"
            onClick={() => navigate('/track-complaint')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                📋
              </div>
              <h3 className="text-xl font-poppins font-semibold text-foreground leading-tight">
                {translations.trackTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {translations.trackDesc}
              </p>
            </div>
            <div className="flex items-center text-blue-500 font-bold text-sm">
              Check history →
            </div>
          </motion.div>

          {/* CTA 3: Emergency SOS */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl border-2 border-red-500/10 bg-red-50/30 dark:bg-red-950/10 backdrop-blur-sm shadow-md flex flex-col justify-between gap-6 cursor-pointer group"
            onClick={() => navigate('/emergency')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl font-bold group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
                🚨
              </div>
              <h3 className="text-xl font-poppins font-semibold text-foreground leading-tight">
                {translations.sosTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {translations.sosDesc}
              </p>
            </div>
            <div className="flex items-center text-red-500 font-bold text-sm">
              Activate SOS alert →
            </div>
          </motion.div>

          {/* CTA 4: Government Schemes */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl border-2 border-yellow-500/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-md flex flex-col justify-between gap-6 cursor-pointer group"
            onClick={() => navigate('/schemes')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center text-2xl font-bold group-hover:bg-yellow-500 group-hover:text-white transition-all shadow-inner">
                🏛
              </div>
              <h3 className="text-xl font-poppins font-semibold text-foreground leading-tight">
                {translations.schemesTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {translations.schemesDesc}
              </p>
            </div>
            <div className="flex items-center text-yellow-600 font-bold text-sm">
              Explore benefits →
            </div>
          </motion.div>
        </section>

        {/* Directories & Local Services */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 dark:text-gray-200">
            Community Services & Directories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Rulebook', desc: 'Rules & Guidelines', icon: BookOpen, route: '/rulebook', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400' },
              { label: 'Local Services', desc: 'Find Local Vendors', icon: Wrench, route: '/village-services', color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400' },
              { label: 'Directory', desc: 'Important Contacts', icon: Phone, route: '/important-contacts', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400' },
              { label: 'Request Service', desc: 'Water/Roads/Lights', icon: Wrench, route: '/service-request', color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400' },
              { label: 'Events & Fairs', desc: 'Upcoming Festivals', icon: Calendar, route: '/community-events', color: 'from-pink-500/10 to-rose-500/10 border-pink-500/20 text-pink-400' },
              { label: 'Announcements', desc: `Village Notice Board (${announcementsCount})`, icon: Megaphone, route: '/announcements', color: 'from-blue-500/10 to-emerald-500/10 border-blue-500/20 text-emerald-400' },
              { label: 'DigiLocker', desc: 'Identity Documents', icon: FolderOpen, route: '/documents', color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400' },
              { label: 'Voice Hub', desc: 'Audio presets & commands', icon: Sliders, route: '/voice-hub', color: 'from-teal-500/10 to-cyan-500/10 border-teal-500/20 text-teal-400' },
              { label: 'Achievements', desc: 'Volunteering badges', icon: Award, route: '/community-profile', color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20 text-yellow-400' },
              { label: 'Village Status', desc: 'Water & Grid power', icon: Activity, route: '/system-status', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400' },
              { label: 'Help & FAQ', desc: 'Tutorials & Chatbot', icon: HelpCircle, route: '/help-support', color: 'from-slate-500/10 to-slate-600/10 border-slate-700/50 text-slate-300' },
            ].map((srv, idx) => {
              const Icon = srv.icon
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(srv.route)}
                  className={`p-4.5 rounded-2xl border bg-gradient-to-br ${srv.color} shadow-sm backdrop-blur-sm cursor-pointer transition-all flex flex-col justify-between h-28`}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  <div className="space-y-0.5">
                    <h4 className="font-poppins font-bold text-xs leading-snug text-foreground">
                      {srv.label}
                    </h4>
                    <p className="text-[10px] text-gray-300 dark:text-gray-200 leading-tight">
                      {srv.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Recent Submissions preview */}
        <section className="bg-white/55 dark:bg-slate-900/55 border border-emerald-500/5 rounded-3xl p-6 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-poppins font-bold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              {translations.recentTitle}
            </h3>
            <button
              onClick={() => navigate('/track-complaint')}
              className="text-xs font-bold text-emerald-500 hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-3">
            {recentComplaints.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-700 dark:text-gray-200 font-semibold">
                No recent complaints filed.
              </div>
            ) : (
              recentComplaints.map((item) => {
                const getStatusBadge = (status: string) => {
                  switch (status?.toLowerCase()) {
                    case 'resolved':
                      return {
                        label: 'Resolved',
                        color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400',
                      }
                    case 'progress':
                    case 'in progress':
                    case 'assigned':
                      return {
                        label: 'In Progress',
                        color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400',
                      }
                    case 'review':
                    case 'under review':
                      return {
                        label: 'Under Review',
                        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400',
                      }
                    default:
                      return {
                        label: 'Registered',
                        color: 'bg-slate-100 text-slate-705 border-slate-200 dark:bg-slate-900 dark:text-gray-200',
                      }
                  }
                }
                const badge = getStatusBadge(item.status)
                const categoryLabels: Record<string, string> = {
                  water: 'Water Supply Issue',
                  electricity: 'Electricity / Light Issue',
                  roads: 'Road Repair Issue',
                  sanitation: 'Sanitation Issue',
                  health: 'Health Service Issue',
                  agri: 'Agriculture Issue',
                }
                const title = categoryLabels[item.category] || `${item.category.toUpperCase()} Issue`

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/track-complaint?id=${item.id}`)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-300 dark:text-gray-200">{item.id}</span>
                        <span className="text-xs text-gray-300 dark:text-gray-200">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-poppins font-semibold text-sm sm:text-base text-foreground">
                        {title}
                      </h4>
                    </div>
                    <span className={`text-xs px-2.5 py-1 font-semibold rounded-lg border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      {/* Floating AI Assistant Trigger */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAssistantOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl flex items-center justify-center text-white border-2 border-white hover:shadow-emerald-500/20 cursor-pointer relative"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
        </motion.button>
      </div>

      {/* Floating AI Assistant Chat panel */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:w-96 bg-white dark:bg-slate-950 border border-emerald-500/20 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm">GramVoice AI Helper</h4>
                  <p className="text-[10px] text-emerald-50">Ready to transcribe or chat</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssistantOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
              {chatLog.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      chat.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-900 text-foreground rounded-bl-none border border-border'
                    }`}
                  >
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="border-t border-border p-3 flex gap-2 bg-slate-50 dark:bg-slate-950">
              <input
                type="text"
                value={assistantText}
                onChange={(e) => setAssistantText(e.target.value)}
                placeholder="Ask via text, or speak..."
                className="flex-grow text-sm py-2 px-3 rounded-xl border border-border focus:border-emerald-500 focus:outline-none bg-white dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => navigate('/record-complaint')}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-950 border-t border-border z-30 flex items-center justify-around py-2 px-6 shadow-lg shadow-black/5">
        {[
          { label: 'Home', icon: Home, active: true },
          { label: 'Complaints', icon: FileText, active: false, route: '/track-complaint' },
          { label: 'SOS Alert', icon: AlertTriangle, active: false, route: '/emergency' },
          { label: 'Profile', icon: User, active: false, route: '/profile' },
        ].map((nav, idx) => (
          <button
            key={idx}
            onClick={() => nav.route && navigate(nav.route)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-xs font-semibold select-none cursor-pointer ${
              nav.active
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <nav.icon className="w-5 h-5" />
            <span>{nav.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
