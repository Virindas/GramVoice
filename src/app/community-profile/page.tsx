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
import { supabase } from '../../lib/supabase'
import { getUser, UserSession } from '../../lib/auth'

export default function CommunityProfile() {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<UserSession | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeSubTab, setActiveSubTab] = React.useState<'badges' | 'leaderboard'>('badges')
  const [achievements, setAchievements] = React.useState<any[]>([])
  const [hasAchievementsTable, setHasAchievementsTable] = React.useState(false)
  const [leaderboard, setLeaderboard] = React.useState<any[]>([])
  const [timeline, setTimeline] = React.useState<any[]>([])
  const [citizenScore, setCitizenScore] = React.useState(0)
  const [volunteerPledgeChecked, setVolunteerPledgeChecked] = React.useState(false)

  React.useEffect(() => {
    const session = getUser()
    if (!session) {
      navigate('/login')
      return
    }
    const currentSession = session
    setUser(currentSession)

    // Load volunteer pledge status from local storage scoped to current user
    const pledged = localStorage.getItem(`gramvoice_volunteer_pledge_${currentSession.id}`) === 'true'
    setVolunteerPledgeChecked(pledged)

    async function loadCommunityData() {
      setLoading(true)
      try {
        // 1. Check if achievements table exists and load badges
        const { data: achData, error: achError } = await supabase
          .from('achievements')
          .select('*')
        
        if (achError) {
          if (achError.code === 'PGRST205' || achError.message?.includes('does not exist') || achError.message?.includes('schema cache')) {
            setHasAchievementsTable(false)
            setAchievements([])
          } else {
            setHasAchievementsTable(true)
            setAchievements([])
          }
        } else {
          setHasAchievementsTable(true)
          setAchievements(achData || [])
        }

        // 2. Fetch submissions to calculate points
        const { data: complaints } = await supabase
          .from('complaints')
          .select('id, created_at, category, user_id')
        
        const { data: serviceRequests } = await supabase
          .from('service_requests')
          .select('id, created_at, user_id')

        const { data: emergencyAlerts } = await supabase
          .from('emergency_alerts')
          .select('id, created_at, emergency_type, user_id')

        const { data: usersList } = await supabase
          .from('users')
          .select('id, name, role')

        const dbUsers = usersList || []
        const dbComplaints = complaints || []
        const dbServiceRequests = serviceRequests || []
        const dbEmergencyAlerts = emergencyAlerts || []

        // Calculate scores for all users
        const userScoresMap: Record<string, number> = {}
        dbUsers.forEach(u => {
          userScoresMap[u.id] = 0
        })

        dbComplaints.forEach(c => {
          if (userScoresMap[c.user_id] !== undefined) {
            userScoresMap[c.user_id] += 150
          }
        })
        dbServiceRequests.forEach(sr => {
          if (userScoresMap[sr.user_id] !== undefined) {
            userScoresMap[sr.user_id] += 100
          }
        })
        dbEmergencyAlerts.forEach(ea => {
          if (userScoresMap[ea.user_id] !== undefined) {
            userScoresMap[ea.user_id] += 50
          }
        })

        // Add volunteer pledge point if pledged
        dbUsers.forEach(u => {
          const isPledged = localStorage.getItem(`gramvoice_volunteer_pledge_${u.id}`) === 'true'
          if (isPledged && userScoresMap[u.id] !== undefined) {
            userScoresMap[u.id] += 50
          }
        })

        // Ranks & avatars
        const avatars = ['👨‍🌾', '👩‍🏫', '👨‍🔧', '👨‍💼', '👩‍⚕️', '👵', '👴', '👩‍🌾']
        const sortedLeaderboard = dbUsers
          .map((u, index) => ({
            id: u.id,
            name: u.name || 'Citizen',
            score: userScoresMap[u.id] || 0,
            avatar: avatars[index % avatars.length],
            isCurrentUser: u.id === currentSession.id
          }))
          .sort((a, b) => b.score - a.score)
          .map((u, idx) => ({
            ...u,
            rank: idx + 1
          }))

        setLeaderboard(sortedLeaderboard)
        setCitizenScore(userScoresMap[currentSession.id] || 0)

        // Timeline construction
        const userComplaints = dbComplaints
          .filter(c => c.user_id === currentSession.id)
          .map(c => ({
            id: `c-${c.id}`,
            title: `Reported ${c.category || 'issue'}`,
            points: 150,
            date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'complaint' as const,
            timestamp: new Date(c.created_at).getTime()
          }))

        const userRequests = dbServiceRequests
          .filter(sr => sr.user_id === currentSession.id)
          .map(sr => ({
            id: `sr-${sr.id}`,
            title: 'Filed Service Request',
            points: 100,
            date: new Date(sr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'volunteer' as const,
            timestamp: new Date(sr.created_at).getTime()
          }))

        const userSOS = dbEmergencyAlerts
          .filter(ea => ea.user_id === currentSession.id)
          .map(ea => ({
            id: `ea-${ea.id}`,
            title: `Triggered emergency SOS: ${ea.emergency_type || 'General'}`,
            points: 50,
            date: new Date(ea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'feedback' as const,
            timestamp: new Date(ea.created_at).getTime()
          }))

        const userTimeline = [...userComplaints, ...userRequests, ...userSOS]

        if (pledged) {
          userTimeline.push({
            id: `pledge-${currentSession.id}`,
            title: 'Pledged to be a Ward 3 Volunteer',
            points: 50,
            date: 'Active',
            type: 'volunteer' as const,
            timestamp: 0
          })
        }

        userTimeline.sort((a, b) => b.timestamp - a.timestamp)
        setTimeline(userTimeline)

      } catch (err) {
        console.error('Error loading community data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCommunityData()
  }, [navigate])

  const handlePledgeVolunteer = () => {
    if (volunteerPledgeChecked) return
    setVolunteerPledgeChecked(true)
    setCitizenScore(prev => prev + 50)
    if (user) {
      localStorage.setItem(`gramvoice_volunteer_pledge_${user.id}`, 'true')
      
      // Update timeline
      setTimeline(prev => [
        ...prev,
        {
          id: `pledge-${user.id}`,
          title: 'Pledged to be a Ward 3 Volunteer',
          points: 50,
          date: 'Active',
          type: 'volunteer' as const,
          timestamp: 0
        }
      ])
    }
    alert('Thank you for pledging! +50 Citizen points added to your score.')
  }

  // Calculate dynamic Level statistics
  const getCitizenLevel = (score: number) => {
    if (score < 100) return 1
    if (score < 300) return 2
    if (score < 600) return 3
    if (score < 1000) return 4
    return 5
  }

  const currentLevel = getCitizenLevel(citizenScore)
  const nextLevelXp = currentLevel === 1 ? 100 : currentLevel === 2 ? 300 : currentLevel === 3 ? 600 : currentLevel === 4 ? 1000 : 2000
  const prevLevelXp = currentLevel === 1 ? 0 : currentLevel === 2 ? 100 : currentLevel === 3 ? 300 : currentLevel === 4 ? 600 : 1000
  const xpProgressPercent = Math.min(((citizenScore - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100, 100)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Loading Citizen Records...</p>
        </div>
      </div>
    )
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
      <main className="grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Citizen Gamified Score Card */}
        <section className="p-6 rounded-3xl border border-slate-850 bg-linear-to-br from-slate-900/50 via-slate-900/30 to-slate-950/50 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 text-center sm:text-left grow">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                Active Contributor
              </span>
              <span className="bg-slate-950 text-slate-400 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold">
                Level {currentLevel} Citizen
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-poppins font-extrabold text-slate-200">
              {user?.name || 'Citizen'}
            </h2>

            {/* Level progress bar */}
            <div className="space-y-1.5 max-w-sm mx-auto sm:mx-0">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>XP Progress to Level {currentLevel + 1}</span>
                <span>{citizenScore} / {nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900 shadow-inner">
                <div 
                  className="bg-linear-to-r from-yellow-500 to-amber-500 h-full rounded-full" 
                  style={{ width: `${xpProgressPercent}%` }}
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
                : 'bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-md shadow-yellow-500/10'
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
                Earned Badges ({hasAchievementsTable ? achievements.length : 0})
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
            <div className="min-h-62.5">
              {activeSubTab === 'badges' ? (
                hasAchievementsTable && achievements.length > 0 ? (
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {achievements.map((badge) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="p-4.5 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 ${badge.color || 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25'}`}>
                            {badge.icon || '🏅'}
                          </div>
                          <div>
                            <h4 className="font-poppins font-bold text-xs text-slate-200">
                              {badge.name}
                            </h4>
                            <span className="text-[9px] text-slate-500 block">Earned: {badge.dateEarned || new Date(badge.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/30 p-2.5 rounded-xl border border-slate-900/40">
                          {badge.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-850 min-h-55">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center text-2xl mb-3.5 shadow-inner">
                      🏅
                    </div>
                    <h4 className="font-poppins font-bold text-xs text-slate-350">
                      No achievements available yet.
                    </h4>
                    <p className="text-[10px] text-slate-550 max-w-xs mt-1 leading-relaxed">
                      Participate in community service requests, report local sanitation/water issues, or volunteer to unlock unique citizen achievements.
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pb-2 border-b border-slate-900">
                    <span>Rank / Name</span>
                    <span>Citizen Score</span>
                  </div>

                  {leaderboard.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-semibold italic">
                      No active users on leaderboard yet.
                    </div>
                  ) : (
                    leaderboard.map((user) => (
                      <motion.div
                        key={user.id}
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
                          <span>{user.score}</span>
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                        </div>
                      </motion.div>
                    ))
                  )}
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
            <div className="relative pl-4 space-y-6 before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-900">
              {timeline.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-slate-500 font-semibold italic">
                  No contributions logged yet.
                </div>
              ) : (
                timeline.map((item) => (
                  <div key={item.id} className="relative space-y-1">
                    {/* Timeline point dot */}
                    <span className="absolute -left-3.25 top-1.5 w-2 h-2 rounded-full bg-yellow-500 border-2 border-slate-950" />
                    
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
                ))
              )}
            </div>
          </div>

        </section>

      </main>
    </div>
  )
}
