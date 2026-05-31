'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  Clock,
  Heart,
  Activity,
  Shield,
  Flame,
  AlertTriangle,
  MapPin,
  CheckCircle,
} from 'lucide-react'

interface EmergencyContact {
  name: string
  role: string
  phone: string
  color: string
  icon: any
}

interface Hospital {
  name: string
  distance: string
  timings: string
  contact: string
  bedsAvailable: number
  hasAmbulance: boolean
}

export default function EmergencyContacts() {
  const navigate = useNavigate()
  
  // Call simulation state
  const [activeDial, setActiveDial] = React.useState<EmergencyContact | null>(null)

  const quickContacts: EmergencyContact[] = [
    { name: 'Panchayat Health Ambulance', role: '24/7 Medical Transit', phone: '108', color: 'from-red-500 to-rose-600', icon: Activity },
    { name: 'Local Police Dispatch', role: 'Security & Ward Patrol', phone: '100', color: 'from-blue-500 to-indigo-600', icon: Shield },
    { name: 'Fire Response Department', role: 'Regional Safety Unit', phone: '101', color: 'from-orange-500 to-amber-600', icon: Flame },
    { name: 'Ward 3 Emergency Officer', role: 'Disaster Coordination', phone: '+91 98765 09210', color: 'from-teal-500 to-emerald-600', icon: AlertTriangle },
  ]

  const hospitals: Hospital[] = [
    {
      name: 'North Village Primary Health Center',
      distance: '1.2 km away',
      timings: '08:00 AM - 08:00 PM',
      contact: '+91 98765 43220',
      bedsAvailable: 8,
      hasAmbulance: true,
    },
    {
      name: 'City Apex Multi-Specialty Hospital',
      distance: '8.5 km away',
      timings: 'Open 24 Hours',
      contact: '+91 98765 43221',
      bedsAvailable: 42,
      hasAmbulance: true,
    },
    {
      name: 'Panchayat Mother & Child Clinic',
      distance: '2.0 km away',
      timings: '09:00 AM - 04:00 PM',
      contact: '+91 98765 43222',
      bedsAvailable: 3,
      hasAmbulance: false,
    },
  ]

  const bloodInventory = [
    { group: 'O +', status: 'Available', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
    { group: 'A +', status: 'Critical Limit', color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' },
    { group: 'B +', status: 'Available', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
    { group: 'AB +', status: 'Out of Stock', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
    { group: 'O -', status: 'Critical Limit', color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' },
  ]

  const triggerCall = (contact: EmergencyContact) => {
    setActiveDial(contact)
  }

  const endCall = () => {
    setActiveDial(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Alerts Warnings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-red-500">Emergency & Healthcare</h1>

        <button
          onClick={() => navigate('/emergency')}
          className="px-3.5 py-1.5 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all cursor-pointer"
        >
          SOS Panic
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Quick Dials (2x2 Grid) */}
        <section className="grid gap-3 grid-cols-2">
          {quickContacts.map((contact, idx) => {
            const Icon = contact.icon
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => triggerCall(contact)}
                className={`p-4 rounded-2xl bg-gradient-to-br ${contact.color} text-white flex flex-col justify-between h-32 shadow-lg cursor-pointer transition-all relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Phone className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h4 className="font-poppins font-extrabold text-sm sm:text-base leading-tight">
                    {contact.name}
                  </h4>
                  <p className="text-[10px] text-white/80 mt-0.5">{contact.role}</p>
                </div>
              </motion.div>
            )
          })}
        </section>

        {/* Blood inventory indicator widget */}
        <section className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
              Panchayat Blood Stock Levels
            </h3>
            <span className="text-[10px] text-gray-300 font-semibold">Updated today</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {bloodInventory.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${item.color}`}
              >
                <span className="w-6 text-center font-extrabold border-r border-current/20 pr-1.5">{item.group}</span>
                <span className="text-[10px] tracking-wide uppercase font-semibold">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Hospitals details list */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Nearby Hospitals & Clinics
          </h3>

          <div className="space-y-3.5">
            {hospitals.map((hospital, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-850 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-poppins font-bold text-sm sm:text-base text-slate-200">
                      {hospital.name}
                    </h4>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                      {hospital.distance}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {hospital.timings}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      {hospital.bedsAvailable} Beds Available
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => triggerCall({ name: hospital.name, role: 'Hospital Contact Desk', phone: hospital.contact, color: 'from-emerald-500 to-teal-500', icon: Activity })}
                    className="flex-grow sm:flex-grow-0 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 font-poppins font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Hospital
                  </button>
                  {hospital.hasAmbulance && (
                    <button
                      onClick={() => triggerCall({ name: `${hospital.name} Dispatch`, role: 'Emergency Transit Call', phone: '108', color: 'from-red-500 to-rose-600', icon: Activity })}
                      className="py-2.5 px-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      title="Request Ambulance"
                    >
                      🚑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Simulated Active Emergency Call overlay */}
      <AnimatePresence>
        {activeDial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-md w-full">
              <div className="space-y-4">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${activeDial.color} mx-auto flex items-center justify-center shadow-2xl`}>
                  <PhoneCall className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-poppins font-extrabold text-white">
                    Emergency Calling...
                  </h2>
                  <p className="text-sm text-red-400 font-semibold">{activeDial.name}</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">Dialing: {activeDial.phone}</p>
                </div>
              </div>

              {/* Simulated ringing dots */}
              <div className="flex gap-2 justify-center py-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-red-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex gap-3 text-left">
                <Activity className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="font-bold text-slate-200">GPS Live Broadcast Active:</p>
                  <p>Broadcasting village coordinates for dispatch routing assistance.</p>
                </div>
              </div>

              <button
                onClick={endCall}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-poppins font-bold shadow-lg shadow-red-500/20 cursor-pointer"
              >
                End Dial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
