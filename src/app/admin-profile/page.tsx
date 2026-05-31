'use client'

import * as React from 'react'
import { AdminLayout } from '../../components/admin-layout'
import {
  User,
  Shield,
  Bell,
  Sliders,
  History,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react'

interface ActivityLogItem {
  id: string
  action: string
  timestamp: string
  details: string
}

const INITIAL_LOGS: ActivityLogItem[] = [
  { id: 'log-1', action: 'Complaint Status Updated', timestamp: 'Today, 10:18 AM', details: 'Marked GV-8898 as "In Progress" (assigned to Road Maintenance Team)' },
  { id: 'log-2', action: 'Panchayat Broadcast Published', timestamp: 'Today, 08:30 AM', details: 'Sent Water Line Maintenance Notice to Wards 1, 2 and 3' },
  { id: 'log-3', action: 'Emergency Dispatch Active', timestamp: 'Yesterday, 04:12 PM', details: 'Dispatched Emergency Ambulance Service near Ward 2 Panchayat Well' },
  { id: 'log-4', action: 'Profile Information Edited', timestamp: 'May 28, 2026', details: 'Updated official email credentials' }
]

export default function AdminProfile() {
  const [logs, setLogs] = React.useState<ActivityLogItem[]>(INITIAL_LOGS)
  const [officerName, setOfficerName] = React.useState('Harish Chandra deshmukh')
  const [officerRole, setOfficerRole] = React.useState('Panchayat Pradhan / Ward Executive Officer')
  const [officerPhone, setOfficerPhone] = React.useState('+91 98765 00921')
  const [officerEmail, setOfficerEmail] = React.useState('pradhan.northvillage@panchayat.gov.in')
  const [isEditing, setIsEditing] = React.useState(false)

  // Settings states
  const [emailAlerts, setEmailAlerts] = React.useState(true)
  const [smsAlerts, setSmsAlerts] = React.useState(true)
  const [sosMute, setSosMute] = React.useState(false)
  const [fontSize, setFontSize] = React.useState('standard')
  const [ttsHelper, setTtsHelper] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(true)

  // Temporary editor states
  const [editName, setEditName] = React.useState(officerName)
  const [editRole, setEditRole] = React.useState(officerRole)
  const [editPhone, setEditPhone] = React.useState(officerPhone)
  const [editEmail, setEditEmail] = React.useState(officerEmail)

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    setOfficerName(editName)
    setOfficerRole(editRole)
    setOfficerPhone(editPhone)
    setOfficerEmail(editEmail)
    setIsEditing(false)

    // Add activity log
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      action: 'Profile Information Edited',
      timestamp: 'Just Now',
      details: 'Updated official contact phone and email credentials.'
    }
    setLogs(prev => [newLog, ...prev])
    alert('Admin profile details updated successfully.')
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return '[&_*]:!text-sm'
      case 'xlarge':
        return '[&_*]:!text-base'
      default:
        return ''
    }
  }

  return (
    <AdminLayout title="Officer Profile & System Settings">
      <div className={`grid gap-6 md:grid-cols-12 transition-all ${getFontSizeClass()}`}>
        {/* Officer Card & Editor */}
        <section className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-900">
            <User className="w-4 h-4 text-blue-500" />
            Panchayat Credentials
          </h3>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/10">
                  {officerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-poppins font-extrabold text-base text-slate-200">{officerName}</h4>
                  <p className="text-[10px] text-blue-450 font-bold tracking-wider uppercase mt-0.5">{officerRole}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-200 pt-2 border-t border-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="font-mono">{officerPhone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="truncate">{officerEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>North Village Panchayat Ward Headquarters</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditName(officerName)
                  setEditRole(officerRole)
                  setEditPhone(officerPhone)
                  setEditEmail(officerEmail)
                  setIsEditing(true)
                }}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-250 font-poppins font-bold text-xs cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                Edit Profile Credentials
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200">Officer Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200">Official Title</label>
                <input
                  type="text"
                  required
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200">Phone Contact</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:border-blue-500 focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200">Gov Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold border border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Global Configuration Controls (Right Side) */}
        <div className="md:col-span-7 space-y-6">
          {/* Dashboard preferences */}
          <div className="p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-900">
              <Sliders className="w-4 h-4 text-blue-500" />
              Portal Accessibilities & Alert Settings
            </h3>

            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              {/* Notification column */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5 pb-1 border-b border-slate-900/60">
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                  Alert Channels
                </h4>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-850 bg-slate-900/20 cursor-pointer hover:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="text-slate-300 leading-none">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-850 bg-slate-900/20 cursor-pointer hover:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="text-slate-300 leading-none">SMS Ticket Alerts</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-850 bg-slate-900/20 cursor-pointer hover:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="text-slate-300 leading-none">Mute Urgent SOS alarms</span>
                  <input
                    type="checkbox"
                    checked={sosMute}
                    onChange={(e) => setSosMute(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Accessibility/Theme column */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5 pb-1 border-b border-slate-900/60">
                  <Sliders className="w-3.5 h-3.5 text-blue-500" />
                  Interface & Theme
                </h4>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-300 font-bold uppercase">Accessibility Text Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full py-2.5 px-3.5 h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold"
                  >
                    <option value="standard">Standard Font Size</option>
                    <option value="large">Large Font (Elderly Friendly)</option>
                    <option value="xlarge">Extra Large Text Mode</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-850 bg-slate-900/20 cursor-pointer hover:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="text-slate-300 leading-none">Voice Assistant Help Voice</span>
                  <input
                    type="checkbox"
                    checked={ttsHelper}
                    onChange={(e) => setTtsHelper(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-850 bg-slate-900/20 cursor-pointer hover:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="text-slate-300 leading-none">High Contrast Dark Mode</span>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Security Settings Placer */}
            <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security Standards: WPA2 & SSL Encrypted
              </span>
              <button
                type="button"
                onClick={() => alert('Change Password simulation requested.')}
                className="py-2 px-4 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-200 font-bold hover:text-white transition-all h-10 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              >
                Change PIN
              </button>
            </div>
          </div>

          {/* Activity Logs (Bottom) */}
          <div className="p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 pb-2 border-b border-slate-900">
              <History className="w-4 h-4 text-blue-500" />
              Official System Activity Logs
            </h3>

            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-850 bg-slate-900/30 flex flex-col sm:flex-row justify-between gap-2.5 text-[11px] leading-relaxed"
                >
                  <div>
                    <h5 className="font-bold text-slate-200">{log.action}</h5>
                    <p className="text-slate-200 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-200 shrink-0 font-mono self-start sm:self-center">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
