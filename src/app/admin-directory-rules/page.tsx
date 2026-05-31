'use client'

import * as React from 'react'
import { AdminLayout } from '../../components/admin-layout'
import {
  Plus,
  Trash,
  Edit2,
  Phone,
  BookOpen,
  AlertOctagon,
  Clock,
  Search,
  HelpCircle,
  Shield,
  Activity,
  Truck,
  Heart,
  X,
  User
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

interface Rule {
  id: string
  title: string
  category: 'water' | 'waste' | 'clean' | 'policy' | 'event'
  content: string
  penalty: string
  effectiveDate: string
}

const INITIAL_CONTACTS: Contact[] = [
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

const INITIAL_RULES: Rule[] = [
  {
    id: 'RULE-1',
    title: 'Water Usage & Conservation Regulations',
    category: 'water',
    content: 'Domestic drinking water from public pipelines must not be used for washing vehicles, construction work, or kitchen gardening. Use recycled or well water for non-consumption activities.',
    penalty: '₹500 for first violation, pipe disconnection for repeated offenses',
    effectiveDate: 'April 01, 2026',
  },
  {
    id: 'RULE-2',
    title: 'Solid Waste Segregation at Source',
    category: 'waste',
    content: 'Every household must segregate waste into dry recyclable, wet biodegradable, and sanitary waste before handing over to the ward collection volunteer daily.',
    penalty: 'Collection refusal and ₹100 fine for unsegregated waste',
    effectiveDate: 'May 10, 2026',
  },
  {
    id: 'RULE-3',
    title: 'Open Littering and Plastic Ban',
    category: 'clean',
    content: 'Throwing plastics, wrappers, or domestic trash in public roads, canals, or Panchayat well areas is strictly prohibited. Single-use plastics under 100 microns are banned in village shops.',
    penalty: '₹200 on-the-spot fine',
    effectiveDate: 'Jan 15, 2026',
  },
  {
    id: 'RULE-4',
    title: 'Night Quiet Hours & Conduct Guidelines',
    category: 'event',
    content: 'Loudspeakers, wedding audio, and public address systems during local festivals or celebrations must be shut down by 10:00 PM in residential zones, as per regional quiet hours policy.',
    penalty: 'Seizure of audio equipment and ₹2,000 penalty',
    effectiveDate: 'Feb 20, 2026',
  },
  {
    id: 'RULE-5',
    title: 'Panchayat Common Land Usage Policy',
    category: 'policy',
    content: 'Temporary construction, farming shelters, or stall set-ups on Panchayat-owned grazing fields or public playgrounds require prior written approval and a permit token.',
    penalty: 'Eviction and ₹1,500 fine',
    effectiveDate: 'March 05, 2026',
  },
]

export default function AdminDirectoryRules() {
  const [activeTab, setActiveTab] = React.useState<'contacts' | 'rules'>('contacts')
  
  // Data States
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [rules, setRules] = React.useState<Rule[]>([])

  // Search States
  const [contactSearch, setContactSearch] = React.useState('')
  const [ruleSearch, setRuleSearch] = React.useState('')

  // Contact Form States
  const [contactName, setContactName] = React.useState('')
  const [contactRole, setContactRole] = React.useState('')
  const [contactPhone, setContactPhone] = React.useState('')
  const [contactCategory, setContactCategory] = React.useState<Contact['category']>('utility')
  const [contactHours, setContactHours] = React.useState('09:00 AM - 05:00 PM')
  const [contactIcon, setContactIcon] = React.useState('User')
  const [contactGradient, setContactGradient] = React.useState('from-blue-500 to-indigo-500')
  const [editingContactId, setEditingContactId] = React.useState<string | null>(null)

  // Rule Form States
  const [ruleTitle, setRuleTitle] = React.useState('')
  const [ruleCategory, setRuleCategory] = React.useState<Rule['category']>('water')
  const [ruleContent, setRuleContent] = React.useState('')
  const [rulePenalty, setRulePenalty] = React.useState('')
  const [ruleEffectiveDate, setRuleEffectiveDate] = React.useState('')
  const [editingRuleId, setEditingRuleId] = React.useState<string | null>(null)

  // Load from localStorage
  React.useEffect(() => {
    const storedContacts = localStorage.getItem('gramvoice_contacts')
    if (storedContacts) {
      try {
        setContacts(JSON.parse(storedContacts))
      } catch {
        setContacts(INITIAL_CONTACTS)
      }
    } else {
      setContacts(INITIAL_CONTACTS)
      localStorage.setItem('gramvoice_contacts', JSON.stringify(INITIAL_CONTACTS))
    }

    const storedRules = localStorage.getItem('gramvoice_rules')
    if (storedRules) {
      try {
        setRules(JSON.parse(storedRules))
      } catch {
        setRules(INITIAL_RULES)
      }
    } else {
      setRules(INITIAL_RULES)
      localStorage.setItem('gramvoice_rules', JSON.stringify(INITIAL_RULES))
    }
  }, [])

  // Sync to localStorage
  const syncContacts = (updated: Contact[]) => {
    setContacts(updated)
    localStorage.setItem('gramvoice_contacts', JSON.stringify(updated))
  }

  const syncRules = (updated: Rule[]) => {
    setRules(updated)
    localStorage.setItem('gramvoice_rules', JSON.stringify(updated))
  }

  // Handle Contact Submit (Add/Edit)
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !contactRole.trim() || !contactPhone.trim()) return

    if (editingContactId) {
      // Update
      const updated = contacts.map(c => 
        c.id === editingContactId 
          ? {
              ...c,
              name: contactName,
              role: contactRole,
              phone: contactPhone,
              category: contactCategory,
              availableHours: contactHours,
              icon: contactIcon,
              color: contactGradient
            }
          : c
      )
      syncContacts(updated)
      setEditingContactId(null)
      alert('Directory contact updated successfully.')
    } else {
      // Add
      const newContact: Contact = {
        id: `c-${Date.now()}`,
        name: contactName,
        role: contactRole,
        phone: contactPhone,
        category: contactCategory,
        availableHours: contactHours,
        color: contactGradient,
        icon: contactIcon
      }
      syncContacts([...contacts, newContact])
      alert('New resource contact added successfully.')
    }

    // Reset Form
    setContactName('')
    setContactRole('')
    setContactPhone('')
    setContactCategory('utility')
    setContactHours('09:00 AM - 05:00 PM')
    setContactIcon('User')
    setContactGradient('from-blue-500 to-indigo-500')
  }

  // Populate Contact Form for Editing
  const startEditContact = (c: Contact) => {
    setEditingContactId(c.id)
    setContactName(c.name)
    setContactRole(c.role)
    setContactPhone(c.phone)
    setContactCategory(c.category)
    setContactHours(c.availableHours)
    setContactIcon(c.icon)
    setContactGradient(c.color)
  }

  const cancelEditContact = () => {
    setEditingContactId(null)
    setContactName('')
    setContactRole('')
    setContactPhone('')
    setContactCategory('utility')
    setContactHours('09:00 AM - 05:00 PM')
    setContactIcon('User')
    setContactGradient('from-blue-500 to-indigo-500')
  }

  // Delete Contact
  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this resource contact?')) {
      const updated = contacts.filter(c => c.id !== id)
      syncContacts(updated)
    }
  }

  // Handle Rule Submit (Add/Edit)
  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleTitle.trim() || !ruleContent.trim() || !rulePenalty.trim()) return

    const effective = ruleEffectiveDate.trim() || new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    if (editingRuleId) {
      // Update
      const updated = rules.map(r => 
        r.id === editingRuleId 
          ? {
              ...r,
              title: ruleTitle,
              category: ruleCategory,
              content: ruleContent,
              penalty: rulePenalty,
              effectiveDate: effective
            }
          : r
      )
      syncRules(updated)
      setEditingRuleId(null)
      alert('Panchayat rule modified successfully.')
    } else {
      // Add
      const newRule: Rule = {
        id: `RULE-${Date.now()}`,
        title: ruleTitle,
        category: ruleCategory,
        content: ruleContent,
        penalty: rulePenalty,
        effectiveDate: effective
      }
      syncRules([...rules, newRule])
      alert('New Panchayat rule added successfully.')
    }

    // Reset Form
    setRuleTitle('')
    setRuleCategory('water')
    setRuleContent('')
    setRulePenalty('')
    setRuleEffectiveDate('')
  }

  // Populate Rule Form for Editing
  const startEditRule = (r: Rule) => {
    setEditingRuleId(r.id)
    setRuleTitle(r.title)
    setRuleCategory(r.category)
    setRuleContent(r.content)
    setRulePenalty(r.penalty)
    setRuleEffectiveDate(r.effectiveDate)
  }

  const cancelEditRule = () => {
    setEditingRuleId(null)
    setRuleTitle('')
    setRuleCategory('water')
    setRuleContent('')
    setRulePenalty('')
    setRuleEffectiveDate('')
  }

  // Delete Rule
  const handleDeleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      const updated = rules.filter(r => r.id !== id)
      syncRules(updated)
    }
  }

  // Helper to map Lucide Icons
  const renderIconMini = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-3.5 h-3.5" />
      case 'Activity': return <Activity className="w-3.5 h-3.5" />
      case 'Shield': return <Shield className="w-3.5 h-3.5" />
      case 'HelpCircle': return <HelpCircle className="w-3.5 h-3.5" />
      case 'Truck': return <Truck className="w-3.5 h-3.5" />
      case 'Heart': return <Heart className="w-3.5 h-3.5" />
      default: return <User className="w-3.5 h-3.5" />
    }
  }

  // Filters
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phone.includes(contactSearch)
  )

  const filteredRules = rules.filter(r =>
    r.title.toLowerCase().includes(ruleSearch.toLowerCase()) ||
    r.content.toLowerCase().includes(ruleSearch.toLowerCase())
  )

  return (
    <AdminLayout title="Directory & Rules Manager">
      {/* Tabs bar */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 w-full max-w-md">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-grow py-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'contacts'
              ? 'bg-slate-900 text-blue-400 shadow-inner'
              : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          Panchayat Directory ({contacts.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-grow py-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-slate-900 text-blue-400 shadow-inner'
              : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Village Rulebook ({rules.length})
        </button>
      </div>

      {activeTab === 'contacts' ? (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Add/Edit Contact Form Panel */}
          <section className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-2 border-b border-slate-900">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                {editingContactId ? 'Edit Directory Record' : 'Add Directory Record'}
              </span>
              {editingContactId && (
                <button 
                  onClick={cancelEditContact}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              )}
            </h3>

            <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name / Station Office</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sohan Lal (Plumber)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Role / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Plumbing technician"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 99999 88888"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <select
                    value={contactCategory}
                    onChange={(e: any) => setContactCategory(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="panchayat">Panchayat</option>
                    <option value="utility">Utility/Services</option>
                    <option value="emergency">Emergency</option>
                    <option value="helpline">Helpline</option>
                    <option value="transport">Transport</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Hours</label>
                  <input
                    type="text"
                    required
                    value={contactHours}
                    onChange={(e) => setContactHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Avatar Icon</label>
                  <select
                    value={contactIcon}
                    onChange={(e) => setContactIcon(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="User">User Profile</option>
                    <option value="Activity">Activity Pulses</option>
                    <option value="Shield">Shield (Police/Safety)</option>
                    <option value="HelpCircle">Help Circle</option>
                    <option value="Truck">Truck/Transport</option>
                    <option value="Heart">Heart (Medical)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Gradient</label>
                  <select
                    value={contactGradient}
                    onChange={(e) => setContactGradient(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="from-emerald-500 to-teal-500">Green Emerald</option>
                    <option value="from-blue-500 to-indigo-500">Blue Indigo</option>
                    <option value="from-blue-500 to-cyan-500">Blue Cyan</option>
                    <option value="from-red-500 to-rose-600">Red Rose</option>
                    <option value="from-pink-500 to-rose-500">Pink Rose</option>
                    <option value="from-pink-500 to-purple-500">Pink Purple</option>
                    <option value="from-amber-500 to-orange-500">Amber Orange</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-poppins font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                {editingContactId ? 'Update Contact Details' : 'Add Contact to Directory'}
              </button>
            </form>
          </section>

          {/* Directory Listings panel (Right Side) */}
          <div className="md:col-span-7 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search directory by name, role, number..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center shrink-0`}>
                        {renderIconMini(c.icon)}
                      </div>
                      <div>
                        <h4 className="font-poppins font-bold text-slate-200">{c.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {c.role} • <span className="font-mono text-blue-400">{c.phone}</span>
                        </p>
                        <p className="text-[9px] text-slate-600 mt-0.5">🕒 Hours: {c.availableHours}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEditContact(c)}
                        className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-2 rounded bg-red-950/30 border border-red-500/10 text-red-400 hover:bg-red-900/40 hover:text-white transition-colors cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/10 text-center text-slate-600 text-xs">
                  No directory contacts match this search.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Add/Edit Rule Form Panel */}
          <section className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-2 border-b border-slate-900">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                {editingRuleId ? 'Edit Panchayat Rule' : 'Add Panchayat Rule'}
              </span>
              {editingRuleId && (
                <button 
                  onClick={cancelEditRule}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              )}
            </h3>

            <form onSubmit={handleRuleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Rule Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solid Waste Segregation Mandate"
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Tag</label>
                  <select
                    value={ruleCategory}
                    onChange={(e: any) => setRuleCategory(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="water">Water Rules</option>
                    <option value="waste">Waste Disposal</option>
                    <option value="clean">Public Cleanliness</option>
                    <option value="policy">Panchayat Lands</option>
                    <option value="event">Festivals / Quiet Hours</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Effective Date</label>
                  <input
                    type="text"
                    placeholder="e.g. June 01, 2026"
                    value={ruleEffectiveDate}
                    onChange={(e) => setRuleEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none placeholder-slate-650"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Rule description body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete guidelines of this municipal ordinance..."
                  value={ruleContent}
                  onChange={(e) => setRuleContent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Penalty / Violations Fine</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹500 fine on first offense"
                  value={rulePenalty}
                  onChange={(e) => setRulePenalty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-poppins font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                {editingRuleId ? 'Update Rulebook Guidelines' : 'Publish Rulebook Ordinance'}
              </button>
            </form>
          </section>

          {/* Rules listings panel (Right Side) */}
          <div className="md:col-span-7 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search rulebook by title or content keywords..."
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredRules.length > 0 ? (
                filteredRules.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-3.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-blue-550" />
                          <span>Effective: {r.effectiveDate}</span>
                          <span>•</span>
                          <span className="uppercase text-blue-450">{r.category}</span>
                        </div>
                        <h4 className="font-poppins font-extrabold text-sm text-slate-200 mt-1 leading-tight">{r.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditRule(r)}
                          className="p-2 rounded bg-slate-900 border border-slate-880 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(r.id)}
                          className="p-2 rounded bg-red-950/30 border border-red-500/10 text-red-400 hover:bg-red-900/40 hover:text-white transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-450 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-900/50">
                      {r.content}
                    </p>

                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-[10px] uppercase">
                      <AlertOctagon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Penalty: {r.penalty}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/10 text-center text-slate-600 text-xs">
                  No rulebook records match this search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
