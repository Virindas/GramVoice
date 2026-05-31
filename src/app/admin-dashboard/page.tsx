'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminLayout } from '../../components/admin-layout'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import {
  FileText,
  AlertOctagon,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Megaphone,
  BarChart3
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

// Dummy charts data
const categoryData = [
  { name: 'Water Leak', count: 2 },
  { name: 'Roads', count: 1 },
  { name: 'Electricity', count: 1 },
  { name: 'Sanitation', count: 1 },
  { name: 'Agri Support', count: 0 },
]

const weeklyData = [
  { day: 'Mon', solved: 4, received: 6 },
  { day: 'Tue', solved: 7, received: 8 },
  { day: 'Wed', solved: 5, received: 5 },
  { day: 'Thu', solved: 8, received: 11 },
  { day: 'Fri', solved: 9, received: 7 },
  { day: 'Sat', solved: 12, received: 9 },
  { day: 'Sun', solved: 6, received: 4 },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<any>(null)
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null)
  const [counts, setCounts] = React.useState({
    pendingComplaints: 0,
    activeSos: 0,
    activeRequests: 0,
    activeNotices: 0,
  })
  const [recentComplaints, setRecentComplaints] = React.useState<any[]>([])

  React.useEffect(() => {
    const session = getUser()
    if (!session) {
      navigate('/login')
      return
    }
    if (session.role !== 'admin') {
      navigate('/login')
      return
    }
    setUser(session)

    async function loadStats() {
      try {
        // 1. Pending complaints count
        const { count: pendingCount } = await supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'Resolved')

        // 2. Active SOS Alerts count
        const { count: sosCount } = await supabase
          .from('emergency_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Active')

        // 3. Service Requests count
        const { count: reqCount } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'resolved')

        // 4. Announcements count
        const { count: noticesCount } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })

        setCounts({
          pendingComplaints: pendingCount || 0,
          activeSos: sosCount || 0,
          activeRequests: reqCount || 0,
          activeNotices: noticesCount || 0,
        })

        // 5. Recent complaints feed
        const { data: comps } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (comps) {
          const userIds = comps.map((c: any) => c.user_id)
          const { data: userList } = await supabase
            .from('users')
            .select('id, name')
            .in('id', userIds)

          const userMap = (userList || []).reduce((acc: any, curr: any) => {
            acc[curr.id] = curr.name
            return acc
          }, {})

          const mappedComps = comps.map((c: any) => ({
            id: c.id,
            villager: userMap[c.user_id] || 'Citizen',
            category: c.category === 'water' ? 'Water Supply' : c.category === 'electricity' ? 'Electricity / Light' : c.category === 'roads' ? 'Road Repair' : c.category === 'sanitation' ? 'Sanitation' : c.category === 'health' ? 'Health' : 'Agriculture',
            date: new Date(c.created_at).toLocaleString(),
            voiceTranscript: c.transcript || 'Voice complaint recorded.',
          }))
          setRecentComplaints(mappedComps)
        }
      } catch (err) {
        console.error('Error loading admin statistics:', err)
      }
    }

    loadStats()
  }, [navigate])

  const handleAudioToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingAudioId === id) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(id)
      setTimeout(() => {
        setPlayingAudioId(null)
      }, 5000) // Mock 5 seconds playback duration
    }
  }

  const statCards = [
    { label: 'Pending Reviews', count: counts.pendingComplaints, color: 'text-yellow-500', icon: Clock, bg: 'bg-yellow-500/10', route: '/admin-complaints' },
    { label: 'Active SOS Alerts', count: counts.activeSos, color: 'text-red-500', icon: AlertTriangle, bg: 'bg-red-500/10', route: '/emergency-control' },
    { label: 'Daily Dispatches', count: counts.activeRequests, color: 'text-blue-500', icon: Briefcase, bg: 'bg-blue-500/10', route: '/operations-control' },
    { label: 'Active Notices', count: counts.activeNotices, color: 'text-emerald-500', icon: Megaphone, bg: 'bg-emerald-500/10', route: '/announcement-management' },
  ]
  return (
    <AdminLayout title="Panchayat Executive Hub">
      {/* Welcome Banner */}
      {user && (
        <section className="bg-gradient-to-r from-blue-700 to-indigo-750 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
              Role: {user.role} | Language: {user.language}
            </p>
            <h2 className="text-2xl sm:text-3xl font-poppins font-extrabold tracking-tight">
              Welcome, {user.name}
            </h2>
          </div>
        </section>
      )}

      {/* Urgent Emergency Alert Banner */}
      <section className="bg-gradient-to-r from-red-950/40 via-red-900/30 to-slate-900 border-2 border-red-500/20 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-400 border border-red-500/30 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-base text-red-400">Active Emergency SOS</h3>
            <p className="text-xs text-gray-200 mt-1">
              Live alert logged from site: Ward 2 Panchayat Well. Snapped live wire reported.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/emergency-control')}
          className="px-4 py-2 bg-red-650 hover:bg-red-600 text-white font-poppins font-bold text-xs rounded-xl transition-colors shadow-lg cursor-pointer"
        >
          Dispatch Emergency Crew
        </button>
      </section>

      {/* Overview Stats Cards */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3, scale: 1.02 }}
            onClick={() => navigate(stat.route)}
            className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-sm flex items-center justify-between gap-4 shadow-lg shadow-black/10 cursor-pointer"
          >
            <div>
              <p className="text-[10px] text-gray-200 font-bold uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-2xl font-poppins font-extrabold mt-1 tracking-tight text-white">
                {stat.count}
              </h4>
            </div>
            <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Charts & Analytics Dashboard */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Categories Bar */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Complaints by Category Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Resolution Line */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            Weekly Resolution Growth
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#cbd5e1" fontSize={10} tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="received" stroke="#f59e0b" name="Received" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="solved" stroke="#10b981" name="Resolved" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Quick Action Shortcuts Grid */}
      <section className="p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
          Executive Shortcut Management Panel
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-center">
          {[
            { label: 'Review Tickets', route: '/admin-complaints', color: 'bg-blue-600/10 hover:bg-blue-650 hover:text-white text-blue-450 border border-blue-500/10' },
            { label: 'Dispatch Repairs', route: '/operations-control', color: 'bg-emerald-600/10 hover:bg-emerald-650 hover:text-white text-emerald-455 border border-emerald-500/10' },
            { label: 'Publish Notices', route: '/announcement-management', color: 'bg-pink-600/10 hover:bg-pink-650 hover:text-white text-pink-450 border border-pink-500/10' },
            { label: 'SOS Dashboard', route: '/emergency-control', color: 'bg-red-600/10 hover:bg-red-650 hover:text-white text-red-450 border border-red-500/10' }
          ].map((act, i) => (
            <button
              key={i}
              onClick={() => navigate(act.route)}
              className={`py-3 px-2 rounded-xl transition-all cursor-pointer font-poppins text-xs font-bold select-none ${act.color}`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </section>

      {/* Recent submissions feed snippet */}
      <section className="bg-slate-950/40 border border-slate-850 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Recent Unmoderated Complaints Feed
          </h3>
          <button
            onClick={() => navigate('/admin-complaints')}
            className="text-[10px] text-blue-300 hover:underline font-bold"
          >
            See Data Table
          </button>
        </div>

        <div className="space-y-3">
          {recentComplaints.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-305 font-semibold">
              No recent complaints logged.
            </div>
          ) : (
            recentComplaints.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate('/admin-complaints')}
                className="p-4 rounded-xl border border-slate-850 bg-slate-900/20 hover:border-slate-750 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-3 text-xs leading-none">
                  <div>
                    <span className="font-bold text-blue-400 font-mono">{comp.id}</span>
                    <span className="text-gray-200 ml-2 font-bold">{comp.villager}</span>
                  </div>
                  <span className="text-[10px] text-gray-350 font-mono">{comp.date}</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-900/60 text-[11px] leading-relaxed italic text-gray-300">
                  <button
                    onClick={(e) => handleAudioToggle(comp.id, e)}
                    className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-colors"
                  >
                    {playingAudioId === comp.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 pl-0.5" />}
                  </button>
                  <p>&quot;{comp.voiceTranscript}&quot;</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
