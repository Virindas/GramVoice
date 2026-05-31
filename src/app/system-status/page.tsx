'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Activity,
  Zap,
  Droplet,
  Wifi,
  ShoppingBag,
  Heart,
  RefreshCw,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface ServiceStatus {
  id: string
  name: string
  category: 'water' | 'power' | 'network' | 'market' | 'health'
  status: 'operational' | 'degraded' | 'disrupted'
  icon: any
  uptime: string
  details: string
  lastChecked: string
  issuesCount: number
}

export default function SystemStatus() {
  const navigate = useNavigate()
  const [secondsToRefresh, setSecondsToRefresh] = React.useState(30)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Status records
  const [statuses, setStatuses] = React.useState<ServiceStatus[]>([
    {
      id: 'srv-1',
      name: 'Main Drinking Water Tank Pipeline',
      category: 'water',
      status: 'operational',
      icon: Droplet,
      uptime: '99.2%',
      details: 'Pressure parameters nominal. Delivery flow to Ward 1-5 active.',
      lastChecked: '2 mins ago',
      issuesCount: 0
    },
    {
      id: 'srv-2',
      name: 'Central Village Solar & Grid Power Feed',
      category: 'power',
      status: 'degraded',
      icon: Zap,
      uptime: '94.8%',
      details: 'Substation transformer overload in Ward 2. Expect transient voltage dips.',
      lastChecked: '4 mins ago',
      issuesCount: 1
    },
    {
      id: 'srv-3',
      name: 'BharatNet Gram Panchayat Optical Fiber Wi-Fi',
      category: 'network',
      status: 'operational',
      icon: Wifi,
      uptime: '98.5%',
      details: 'Active connection in central village plaza and Panchayat bhawan.',
      lastChecked: 'Just now',
      issuesCount: 0
    },
    {
      id: 'srv-4',
      name: 'Weekly Farmers Cooperative Marketplace',
      category: 'market',
      status: 'operational',
      icon: ShoppingBag,
      uptime: '100%',
      details: 'Booth allocations for tomorrow are 100% complete.',
      lastChecked: '10 mins ago',
      issuesCount: 0
    },
    {
      id: 'srv-5',
      name: 'Primary Health Care & Vaccination Unit',
      category: 'health',
      status: 'operational',
      icon: Heart,
      uptime: '99.9%',
      details: 'Outpatient clinic operational. Pediatric vaccine drive starting tomorrow.',
      lastChecked: '15 mins ago',
      issuesCount: 0
    }
  ])

  // simulated countdown auto-refresh
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh(prev => {
        if (prev <= 1) {
          handleTriggerRefresh()
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleTriggerRefresh = () => {
    setIsRefreshing(true)
    
    // Simulate updating last checked time
    setTimeout(() => {
      setStatuses(prev => 
        prev.map(item => ({
          ...item,
          lastChecked: 'Just now'
        }))
      )
      setIsRefreshing(false)
      setSecondsToRefresh(30)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-90 h-90 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-emerald-400 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          <span>Village Infrastructure Status</span>
        </h1>

        <button
          onClick={handleTriggerRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Banner with Refresh Timer */}
        <section className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest leading-none">Live Telemetry Board</p>
            <h2 className="text-xl sm:text-2xl font-poppins font-extrabold tracking-tight text-slate-200">
              Live Village Utility Status
            </h2>
            <p className="text-xs text-slate-400">
              Real-time feed showing water pipelines, solar grid grids, connectivity, and health booths status.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-900 text-xs shrink-0 select-none">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400 font-medium">Auto-refreshing in:</span>
            <span className="text-emerald-400 font-mono font-bold">{secondsToRefresh}s</span>
          </div>
        </section>

        {/* Highlight Alert Banner if degraded */}
        {statuses.some(s => s.status !== 'operational') && (
          <section className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-start gap-3 text-xs leading-relaxed animate-pulse">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sub-nominal Performance Logged</p>
              <p className="text-slate-400 mt-0.5">
                Central Grid power feed is showing degraded voltage levels in Ward 2. Staff have been dispatched. Water tanks and communications are fully nominal.
              </p>
            </div>
          </section>
        )}

        {/* Services Status Cards List */}
        <section className="space-y-4">
          {statuses.map((item) => {
            const Icon = item.icon
            const isOperational = item.status === 'operational'
            const isDegraded = item.status === 'degraded'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative group"
              >
                {/* Core description */}
                <div className="flex items-start gap-4 flex-grow">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isOperational
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : isDegraded
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-poppins font-bold text-sm text-slate-200">
                        {item.name}
                      </h4>
                      {/* Pulsing indicator */}
                      <span className="relative flex h-2 w-2 mt-0.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isOperational ? 'bg-emerald-400' : isDegraded ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          isOperational ? 'bg-emerald-500' : isDegraded ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.details}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>Uptime: <span className="text-slate-400 font-semibold">{item.uptime}</span></span>
                      <span>•</span>
                      <span>Checked: <span className="text-slate-400 font-semibold">{item.lastChecked}</span></span>
                    </div>
                  </div>
                </div>

                {/* Status actions / telemetry badge */}
                <div className="flex items-center justify-between sm:justify-end border-t border-slate-850 pt-3 sm:pt-0 sm:border-t-0 shrink-0 gap-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border ${
                    isOperational 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : isDegraded
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {item.status}
                  </span>

                  {!isOperational && (
                    <button
                      onClick={() => navigate('/record-complaint')}
                      className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/50 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Report Outage
                    </button>
                  )}
                </div>

              </motion.div>
            )
          })}
        </section>

        {/* Quick actions box */}
        <section className="p-5 rounded-3xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Noticed an unlisted outage?
            </h4>
            <p className="text-xs text-slate-500">
              If drinking water pipelines or streetlights are disrupted in your street, register a voice ticket instantly.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/record-complaint')}
            className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-poppins font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-colors cursor-pointer shrink-0"
          >
            File Quick Complaint
          </button>
        </section>

      </main>
    </div>
  )
}
