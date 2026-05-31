'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Flame,
  Activity,
  CheckCircle,
  Sparkles,
  Star
} from 'lucide-react'

interface BadgeItem {
  id: string
  name: string
  icon: string
  desc: string
  dateEarned: string
  color: string
}

interface LeaderboardUser {
  rank: number
  name: string
  score: number
  avatar: string
  isCurrentUser?: boolean
}

interface TimelineContribution {
  id: string
  title: string
  points: number
  date: string
  type: 'complaint' | 'rsvp' | 'volunteer' | 'feedback'
}

const BADGES_DATA: BadgeItem[] = [
  { id: 'b-1', name: 'Cleanliness Guardian', icon: '🧹', desc: 'Reported & verified 5 sanitation issues successfully.', dateEarned: 'May 12, 2026', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  { id: 'b-2', name: 'Active Citizen', icon: '🏛️', desc: 'Attended 3 consecutive Grama Sabha meetings.', dateEarned: 'May 20, 2026', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  { id: 'b-3', name: 'Water Watcher', icon: '💧', desc: 'First to report water distribution pipeline leak in Ward 3.', dateEarned: 'May 28, 2026', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' },
  { id: 'b-4', name: 'Solar pioneer', icon: '☀️', desc: 'Pledged support for Panchayat solar project.', dateEarned: 'May 29, 2026', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' }
]

const LEADERBOARD_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Anil Deshmukh', score: 980, avatar: '👨‍🌾' },
  { rank: 2, name: 'Savitri Bai', score: 920, avatar: '👩‍🏫' },
  { rank: 3, name: 'Ramesh Kumar (You)', score: 860, avatar: '👨‍🔧', isCurrentUser: true },
  { rank: 4, name: 'Gopal Hegde', score: 840, avatar: '👨‍💼' },
  { rank: 5, name: 'Priya Nair', score: 790, avatar: '👩‍⚕️' }
]

const TIMELINE_CONTRIBUTIONS: TimelineContribution[] = [
  { id: 'c-1', title: 'Reported water leakage in Ward 3', points: 150, date: 'May 28, 2026', type: 'complaint' },
  { id: 'c-2', title: 'Confirmed RSVP for Grama Sabha meeting', points: 50, date: 'May 25, 2026', type: 'rsvp' },
  { id: 'c-3', title: 'Registered feedback for secondary school library', points: 100, date: 'May 18, 2026', type: 'feedback' },
  { id: 'c-4', title: 'Volunteered for temple clean-up crew', points: 200, date: 'May 12, 2026', type: 'volunteer' }
]

export default function CommunityProfile() {
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = React.useState<'badges' | 'leaderboard'>('badges')
  const [citizenScore, setCitizenScore] = React.useState(860)
  const [volunteerPledgeChecked, setVolunteerPledgeChecked] = React.useState(false)

  const handlePledgeVolunteer = () => {
    if (volunteerPledgeChecked) return
    setVolunteerPledgeChecked(true)
    setCitizenScore(prev => prev + 50)
    alert('Thank you for pledging! +50 Citizen points added to your score.')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-90 h-90 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-yellow-400 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span>Citizen Achievements</span>
        </h1>

        <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">
          🏆
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Citizen Gamified Score Card */}
        <section className="p-6 rounded-3xl border border-slate-850 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-950/50 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 text-center sm:text-left flex-grow">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                Active Contributor
              </span>
              <span className="bg-slate-950 text-slate-400 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold">
                Level 4 Citizen
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-poppins font-extrabold text-slate-200">
              Ramesh Kumar
            </h2>

            {/* Level progress bar */}
            <div className="space-y-1.5 max-w-sm mx-auto sm:mx-0">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>XP Progress to Level 5</span>
                <span>860 / 1000 XP</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full" 
                  style={{ width: `${(citizenScore / 1000) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Large circular point display */}
          <div className="w-28 h-28 rounded-full bg-slate-950 border-4 border-yellow-500/25 flex flex-col items-center justify-center shadow-lg shrink-0 select-none relative group overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500/5 rounded-full filter blur-md animate-pulse" />
            <span className="text-2xl font-poppins font-extrabold text-yellow-400 tracking-tight">
              {citizenScore}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Citizen Points
            </span>
          </div>
        </section>

        {/* Contribution Actions / Pledge */}
        <section className="p-5 rounded-3xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-poppins font-bold text-slate-200 flex items-center gap-1 justify-center md:justify-start">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Pledge to be a Ward 3 Volunteer
            </h4>
            <p className="text-xs text-slate-400 max-w-md">
              Get notified directly when immediate local repairs, audits, or food distribution events require active citizen assistance.
            </p>
          </div>
          
          <button
            onClick={handlePledgeVolunteer}
            disabled={volunteerPledgeChecked}
            className={`py-2.5 px-5 rounded-xl font-poppins font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              volunteerPledgeChecked
                ? 'bg-slate-800 text-slate-500 border border-slate-750 cursor-default'
                : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-md shadow-yellow-500/10'
            }`}
          >
            {volunteerPledgeChecked ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Volunteer Pledge Confirmed
              </>
            ) : (
              'Accept Volunteer Pledge (+50 XP)'
            )}
          </button>
        </section>

        {/* Dynamic sub tab layout (Badges vs Leaderboard) */}
        <section className="grid gap-6 md:grid-cols-12">
          
          {/* Main badges or leaderboard column */}
          <div className="md:col-span-7 space-y-4">
            {/* Tabs selector */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
              <button
                onClick={() => setActiveSubTab('badges')}
                className={`flex-1 py-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center ${
                  activeSubTab === 'badges'
                    ? 'bg-slate-900 text-yellow-400 shadow-inner'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Earned Badges ({BADGES_DATA.length})
              </button>
              <button
                onClick={() => setActiveSubTab('leaderboard')}
                className={`flex-1 py-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center ${
                  activeSubTab === 'leaderboard'
                    ? 'bg-slate-900 text-yellow-400 shadow-inner'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Ward Leaderboard
              </button>
            </div>

            {/* Tab content conditional display */}
            <div className="min-h-[250px]">
              {activeSubTab === 'badges' ? (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {BADGES_DATA.map((badge) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="p-4.5 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 ${badge.color}`}>
                          {badge.icon}
                        </div>
                        <div>
                          <h4 className="font-poppins font-bold text-xs text-slate-200">
                            {badge.name}
                          </h4>
                          <span className="text-[9px] text-slate-500 block">Earned: {badge.dateEarned}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/30 p-2.5 rounded-xl border border-slate-900/40">
                        {badge.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pb-2 border-b border-slate-900">
                    <span>Rank / Name</span>
                    <span>Citizen Score</span>
                  </div>

                  {LEADERBOARD_DATA.map((user) => (
                    <motion.div
                      key={user.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        user.isCurrentUser
                          ? 'border-yellow-500/40 bg-yellow-500/5'
                          : 'border-slate-850 bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-5 text-center font-mono font-bold text-xs ${
                          user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          #{user.rank}
                        </span>
                        
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-lg">
                          {user.avatar}
                        </div>
                        
                        <span className={`text-xs font-bold ${user.isCurrentUser ? 'text-yellow-400' : 'text-slate-200'}`}>
                          {user.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-poppins font-extrabold text-xs text-slate-200">
                        <span>{user.isCurrentUser ? citizenScore : user.score}</span>
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timeline Contribution Feed (Right side) */}
          <div className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
              <Activity className="w-4 h-4 text-yellow-500" />
              Contribution Timeline
            </h3>

            {/* Timeline vertical chain */}
            <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-900">
              {TIMELINE_CONTRIBUTIONS.map((item) => (
                <div key={item.id} className="relative space-y-1">
                  {/* Timeline point dot */}
                  <span className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-yellow-500 border-2 border-slate-950" />
                  
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-slate-500">{item.date}</span>
                    <span className="text-[10px] font-mono font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.2 rounded">
                      +{item.points} XP
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-300 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[9px] uppercase font-bold text-slate-500">
                    Category: {item.type}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  )
}
