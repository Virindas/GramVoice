'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Settings,
  Languages,
  Volume2,
  Bell,
  History,
  Edit2,
  LogOut,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser, saveUser, logout } from '../../lib/auth'

export default function ProfileSettings() {
  const navigate = useNavigate()

  // App Theme state
  const [themeMode] = React.useState<'dark' | 'light'>('light')
  
  // Font scale scaling mock
  const [fontScale, setFontScale] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('md')
  
  // Accessibility preferences
  const [langPreference, setLangPreference] = React.useState('en')
  const [speakGuides, setSpeakGuides] = React.useState(true)
  const [pushNotif, setPushNotif] = React.useState(true)
  const [aiVoiceGender, setAiVoiceGender] = React.useState<'male' | 'female'>('female')

  // Edit profile states
  const [showEditProfile, setShowEditProfile] = React.useState(false)
  const [userName, setUserName] = React.useState('')
  const [userWard, setUserWard] = React.useState('')
  const [userPhone, setUserPhone] = React.useState('')
  const [user, setUser] = React.useState<any>(null)

  // Grievance history list
  const [complaintsHistory, setComplaintsHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  // Logout state
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/landing')
  }

  // Accessibility guide speaks on hover if enabled
  const triggerSpeakGuide = (text: string) => {
    if (!speakGuides) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  React.useEffect(() => {
    const session = getUser()
    if (!session) {
      navigate('/login')
      return
    }
    setUser(session)
    setUserName(session.name || '')
    setUserWard(session.address || '')
    setUserPhone(session.phone || '')
    setLangPreference(session.language === 'हिन्दी' ? 'hi' : session.language === 'தமிழ்' ? 'ta' : 'en')

    const userId = session.id

    async function loadComplaints() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        if (data) {
          const mapped = data.map((item: any) => {
            const catLabels: Record<string, string> = {
              water: 'Water Pipeline Leakage',
              electricity: 'Broken Street Light / Electricity',
              roads: 'Road Repair',
              sanitation: 'Sanitation cleanup',
              health: 'Health Service Issue',
              agri: 'Agriculture support',
            }
            return {
              id: item.id,
              category: catLabels[item.category] || item.category,
              date: new Date(item.created_at).toLocaleDateString(),
              status: item.status || 'Pending'
            }
          })
          setComplaintsHistory(mapped)
        }
      } catch (err) {
        console.error('Error fetching complaints history in profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadComplaints()

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [navigate])

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      const dbLang = langPreference === 'hi' ? 'हिन्दी' : langPreference === 'ta' ? 'தமிழ்' : 'English'
      const { error } = await supabase
        .from('users')
        .update({
          name: userName,
          language: dbLang
        })
        .eq('id', user.id)

      if (error) throw error

      const updatedSession = {
        ...user,
        name: userName,
        address: userWard,
        phone: userPhone,
        language: dbLang
      }
      saveUser(updatedSession)
      setUser(updatedSession)
      setShowEditProfile(false)
    } catch (err) {
      console.error('Error saving profile changes:', err)
      alert('Could not update profile details.')
    }
  }

  // Class helper for font scaling
  const getFontScaleClass = () => {
    switch (fontScale) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-base'
      case 'xl':
        return 'text-lg font-semibold'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className={`min-h-screen pb-16 font-sans relative overflow-hidden flex flex-col justify-between transition-colors duration-200 ${
      themeMode === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    } ${getFontScaleClass()}`}>
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className={`relative z-10 px-4 py-4 sm:px-6 flex items-center justify-between border-b ${
        themeMode === 'light' ? 'border-slate-200 bg-white/80' : 'border-slate-900 bg-slate-950/80'
      } backdrop-blur-md`}>
        <button
          onClick={() => navigate('/villager-dashboard')}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-sm">Dashboard</span>
        </button>

        <h1 className="font-poppins font-bold text-lg text-emerald-500">Profile & Settings</h1>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Settings Grid */}
      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* User Card */}
        <section
          onMouseEnter={() => triggerSpeakGuide(`Profile section of ${userName}, Ward details: ${userWard}`)}
          className={`p-6 rounded-3xl border flex items-center justify-between gap-4 shadow-lg ${
            themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-850'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-poppins font-extrabold text-lg text-foreground leading-tight">
                {userName}
              </h3>
              <p className={`text-xs mt-0.5 ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{userWard} • {userPhone}</p>
            </div>
          </div>

          <button
            onClick={() => setShowEditProfile(true)}
            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer border border-emerald-500/20"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </section>

        {/* Accessibility Panel */}
        <section className={`p-6 rounded-3xl border space-y-5 shadow-md ${
          themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/45 border-slate-850'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border ${
            themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <Settings className="w-4 h-4 text-emerald-500" />
            Accessibility & Preferences
          </h3>

          <div className="space-y-4">
            
            {/* Setting 1: Language */}
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-slate-400" />
                  Primary Language
                </h4>
                <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Select interface and voice helper language</p>
              </div>

              <select
                value={langPreference}
                onChange={(e) => setLangPreference(e.target.value)}
                className={`text-sm font-semibold h-11 py-2 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/40 focus:border-emerald-500 cursor-pointer transition-all ${
                  themeMode === 'light' ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>


            {/* Setting 3: Font Scale */}
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">Text Font Size</h4>
                <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Scale text for improved readability</p>
              </div>

              <div className={`flex items-center border rounded-xl overflow-hidden h-11 ${
                themeMode === 'light' ? 'border-slate-200 bg-slate-100' : 'border-slate-800 bg-slate-950'
              }`}>
                {(['sm', 'md', 'lg', 'xl'] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setFontScale(scale)}
                    className={`px-4 h-full text-xs sm:text-sm font-bold cursor-pointer transition-all focus:outline-none ${
                      fontScale === scale
                        ? 'bg-emerald-500 text-white font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                    }`}
                  >
                    {scale.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 4: Audio Guide Toggles */}
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  Voice Readout Guide
                </h4>
                <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Speak guides automatically on hover</p>
              </div>

              <button
                onClick={() => setSpeakGuides(!speakGuides)}
                className={`h-11 py-2 px-5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  speakGuides
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                {speakGuides ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Setting 5: AI Voice Gender */}
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">AI Voice Gender</h4>
                <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Preferences for assistant spoken answers</p>
              </div>

              <div className="flex rounded-xl overflow-hidden border border-border h-11">
                <button
                  onClick={() => setAiVoiceGender('female')}
                  className={`px-5 h-full text-xs sm:text-sm font-bold cursor-pointer transition-all focus:outline-none ${
                    aiVoiceGender === 'female' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-900/10'
                  }`}
                >
                  Female
                </button>
                <button
                  onClick={() => setAiVoiceGender('male')}
                  className={`px-5 h-full text-xs sm:text-sm font-bold cursor-pointer transition-all focus:outline-none ${
                    aiVoiceGender === 'male' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-900/10'
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Setting 6: Notifications */}
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-slate-400" />
                  Panchayat Notice Alerts
                </h4>
                <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Push notifications for emergency alerts</p>
              </div>

              <button
                onClick={() => setPushNotif(!pushNotif)}
                className={`h-11 py-2 px-5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  pushNotif
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                {pushNotif ? 'ON' : 'OFF'}
              </button>
            </div>

          </div>
        </section>

        {/* Complaint History Accordion */}
        <section className={`p-6 rounded-3xl border space-y-4 shadow-md ${
          themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-850'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border ${
            themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <History className="w-4 h-4 text-emerald-500" />
            Your Submitted Grievances ({complaintsHistory.length})
          </h3>

          <div className="space-y-2.5">
            {loading ? (
              <div className={`text-center py-6 text-xs font-semibold ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Loading history...
              </div>
            ) : complaintsHistory.length === 0 ? (
              <div className={`text-center py-6 text-xs font-semibold ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                No complaints submitted yet.
              </div>
            ) : (
              complaintsHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/track-complaint?id=${item.id}`)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    themeMode === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-bold font-mono ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{item.id}</span>
                    <h4 className="font-poppins font-bold text-sm text-foreground">{item.category}</h4>
                    <p className={`text-[10px] ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{item.date}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'Resolved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
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
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-poppins font-bold text-base text-slate-200">
                  Edit Personal Details
                </h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Village Ward
                  </label>
                  <input
                    type="text"
                    value={userWard}
                    onChange={(e) => setUserWard(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-sm"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-poppins font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  Save Profile Info
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
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
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mx-auto flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-poppins font-bold text-base text-slate-200">Confirm Portal Logout?</h4>
                <p className="text-xs text-white leading-relaxed px-4">
                  You will need to verify your OTP again on next session login request.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-grow py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-poppins font-bold text-xs cursor-pointer transition-colors shadow-md shadow-red-500/15"
                >
                  Confirm Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-grow py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-poppins font-bold text-xs cursor-pointer transition-colors border border-slate-750"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
