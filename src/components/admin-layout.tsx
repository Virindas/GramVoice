'use client'

import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Siren,
  Megaphone,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  BookOpen
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/admin-dashboard' },
    { label: 'Complaints', icon: FileText, route: '/admin-complaints' },
    { label: 'Operations', icon: Wrench, route: '/operations-control' },
    { label: 'SOS Control', icon: Siren, route: '/emergency-control' },
    { label: 'Announcements', icon: Megaphone, route: '/announcement-management' },
    { label: 'Analytics', icon: BarChart3, route: '/admin-analytics' },
    { label: 'Directory & Rules', icon: BookOpen, route: '/admin-directory-rules' },
    { label: 'Profile', icon: User, route: '/admin-profile' },
  ]

  // Actual pattern matching for routing helper
  const isRouteActive = (route: string | RegExp) => {
    if (typeof route === 'string') {
      return location.pathname === route
    }
    return route.test(location.pathname)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of the Panchayat Admin Portal?')) {
      navigate('/landing')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden flex flex-col md:flex-row">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white/90 backdrop-blur-md relative z-10 shrink-0">
        {/* Brand header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            P
          </div>
          <div>
            <h1 className="font-poppins font-bold text-sm leading-tight text-slate-800">Panchayat Portal</h1>
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Administration</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const routeStr = typeof item.route === 'string' ? item.route : '/announcement-management'
            const active = isRouteActive(item.route)

            return (
              <Link
                key={idx}
                to={routeStr}
                className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold font-poppins transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-105'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold font-poppins text-red-650 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-200 focus:outline-none"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 border-b border-slate-200 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            P
          </div>
          <div>
            <h1 className="font-poppins font-bold text-xs leading-none text-slate-800">{title}</h1>
            <p className="text-[9px] text-slate-600 font-semibold tracking-wider uppercase mt-0.5">Panchayat Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[57px] inset-x-0 bg-white/95 border-b border-slate-200 z-20 p-4 space-y-2 backdrop-blur-lg flex flex-col"
          >
            {navItems.map((item, idx) => {
              const Icon = item.icon
              const routeStr = typeof item.route === 'string' ? item.route : '/announcement-management'
              const active = isRouteActive(item.route)

              return (
                <Link
                  key={idx}
                  to={routeStr}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 py-3 px-4.5 rounded-xl text-xs font-bold font-poppins transition-all ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-650 hover:text-slate-905 bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3.5 py-3 px-4.5 rounded-xl text-xs font-bold font-poppins text-red-650 bg-red-50 border border-red-200 text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Main Workspace Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto max-h-screen md:max-h-none">
        {/* Header toolbar (Only desktop shows search/user) */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white/80 border-b border-slate-200 backdrop-blur-md px-6 py-4 justify-between items-center shrink-0">
          <h2 className="text-lg font-poppins font-extrabold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            {title}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-700">Pradhan Office</span>
              <span className="text-[10px] text-slate-600 font-semibold font-mono">ID: GV-ADMIN-01</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace Page container */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
