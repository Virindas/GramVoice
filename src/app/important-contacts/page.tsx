'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Phone,
  PhoneCall,
  User,
  Shield,
  Activity,
  HelpCircle,
  Truck,
  Heart,
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  role: string
  phone: string
  category: 'panchayat' | 'utility' | 'emergency' | 'helpline' | 'transport' | 'volunteer'
  availableHours: string
  color: string
  icon: string
}

const CONTACTS_DATA: Contact[] = [
  {
    id: 'c-1',
    name: 'Panchayat Pradhan (Village Leader)',
    role: 'Ramesh Singh',
    phone: '+91 98765 00010',
    category: 'panchayat',
    availableHours: '09:00 AM - 05:00 PM',
    color: 'from-emerald-500 to-teal-500',
    icon: 'User',
  },
  {
    id: 'c-2',
    name: 'Panchayat Ward 3 Volunteer',
    role: 'Sita Devi',
    phone: '+91 98765 00011',
    category: 'volunteer',
    availableHours: '08:00 AM - 08:00 PM',
    color: 'from-teal-500 to-emerald-600',
    icon: 'User',
  },
  {
    id: 'c-3',
    name: 'Water Supply Board Office',
    role: 'Main Pump House Desk',
    phone: '+91 98765 00012',
    category: 'utility',
    availableHours: '24 Hours Emergency',
    color: 'from-blue-500 to-indigo-500',
    icon: 'Activity',
  },
  {
    id: 'c-4',
    name: 'Electricity Distribution Grid Office',
    role: 'Lineman Duty Desk',
    phone: '+91 98765 00013',
    category: 'utility',
    availableHours: '08:00 AM - 10:00 PM',
    color: 'from-blue-500 to-cyan-500',
    icon: 'Activity',
  },
  {
    id: 'c-5',
    name: 'Police Sector Dispatch Station',
    role: 'Duty Sub-Inspector Desk',
    phone: '100',
    category: 'emergency',
    availableHours: '24 Hours Open',
    color: 'from-red-500 to-rose-600',
    icon: 'Shield',
  },
  {
    id: 'c-6',
    name: 'Women Welfare Helpline',
    role: 'National Support Line',
    phone: '1091',
    category: 'helpline',
    availableHours: '24 Hours Toll-Free',
    color: 'from-pink-500 to-rose-500',
    icon: 'HelpCircle',
  },
  {
    id: 'c-7',
    name: 'Child Support Helpline',
    role: 'National Childline Desk',
    phone: '1098',
    category: 'helpline',
    availableHours: '24 Hours Toll-Free',
    color: 'from-pink-500 to-purple-500',
    icon: 'HelpCircle',
  },
  {
    id: 'c-8',
    name: 'Public Bus Transit Station Desk',
    role: 'Regional Bus Conductor Coordinator',
    phone: '+91 98765 00014',
    category: 'transport',
    availableHours: '06:00 AM - 09:00 PM',
    color: 'from-amber-500 to-orange-500',
    icon: 'Truck',
  },
]

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'User': return User
    case 'Activity': return Activity
    case 'Shield': return Shield
    case 'HelpCircle': return HelpCircle
    case 'Truck': return Truck
    case 'Heart': return Heart
    default: return User
  }
}

export default function ImportantContacts() {
  const navigate = useNavigate()
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [activeDial, setActiveDial] = React.useState<Contact | null>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem('gramvoice_contacts')
    if (stored) {
      try {
        setContacts(JSON.parse(stored))
      } catch {
        setContacts(CONTACTS_DATA)
      }
    } else {
      setContacts(CONTACTS_DATA)
      localStorage.setItem('gramvoice_contacts', JSON.stringify(CONTACTS_DATA))
    }
  }, [])

  const categories = [
    { id: 'all', label: 'All Contacts' },
    { id: 'panchayat', label: 'Panchayat' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'utility', label: 'Utilities' },
    { id: 'helpline', label: 'Helplines' },
    { id: 'volunteer', label: 'Volunteers' },
  ]

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || contact.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-90 h-90 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-blue-400">Contacts Directory</h1>

        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
          📞
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Search */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search contact name, officer, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors text-sm"
            />
          </div>
        </section>

        {/* Category horizontal scroller */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-2 px-3.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </section>

        {/* Contacts Grid */}
        <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => {
            const Icon = getIconComponent(contact.icon)
            return (
              <div
                key={contact.id}
                className="p-5 rounded-2xl border border-slate-850 bg-slate-900/45 hover:border-slate-750 transition-all flex flex-col justify-between gap-4 backdrop-blur-sm shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${contact.color} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-slate-200 leading-tight">
                        {contact.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{contact.role}</p>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-900/50 w-fit">
                    🕒 {contact.availableHours}
                  </p>
                </div>

                <button
                  onClick={() => setActiveDial(contact)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-poppins font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-750 cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  Call Now: {contact.phone}
                </button>
              </div>
            )
          })}
        </section>
      </main>

      {/* Simulated Active Call overlay */}
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
                    Calling Directory Contact...
                  </h2>
                  <p className="text-sm text-blue-400 font-semibold">{activeDial.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">Dialing: {activeDial.phone}</p>
                </div>
              </div>

              {/* Simulated ringing dots */}
              <div className="flex gap-2 justify-center py-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-blue-500"
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
                <Heart className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="font-bold text-slate-200">Interactive Call System:</p>
                  <p>Calling through the local Panchayat community exchange portal.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDial(null)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-poppins font-bold shadow-lg cursor-pointer"
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
