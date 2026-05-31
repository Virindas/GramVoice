'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react'

interface Rule {
  id: string
  title: string
  category: 'water' | 'waste' | 'clean' | 'policy' | 'event'
  content: string
  penalty: string
  effectiveDate: string
}

const RULES_DATA: Rule[] = [
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

export default function VillageRulebook() {
  const navigate = useNavigate()
  const [rules, setRules] = React.useState<Rule[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [bookmarkedRuleIds, setBookmarkedRuleIds] = React.useState<string[]>([])
  const [speakingRuleId, setSpeakingRuleId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem('gramvoice_rules')
    if (stored) {
      try {
        setRules(JSON.parse(stored))
      } catch {
        setRules(RULES_DATA)
      }
    } else {
      setRules(RULES_DATA)
      localStorage.setItem('gramvoice_rules', JSON.stringify(RULES_DATA))
    }
  }, [])

  const categories = [
    { id: 'all', label: 'All Conduct' },
    { id: 'water', label: 'Water Rules' },
    { id: 'waste', label: 'Waste Disposal' },
    { id: 'clean', label: 'Public Cleanliness' },
    { id: 'policy', label: 'Panchayat Lands' },
    { id: 'event', label: 'Festivals' },
  ]

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookmarkedRuleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSpeakRule = (rule: Rule, e: React.MouseEvent) => {
    e.stopPropagation()
    if (speakingRuleId === rule.id) {
      window.speechSynthesis.cancel()
      setSpeakingRuleId(null)
      return
    }

    window.speechSynthesis.cancel()
    const text = `Rule: ${rule.title}. Details: ${rule.content}. Penalty: ${rule.penalty}.`
    const utterance = new SpeechSynthesisUtterance(text)
    
    utterance.onend = () => {
      setSpeakingRuleId(null)
    }
    utterance.onerror = () => {
      setSpeakingRuleId(null)
    }

    setSpeakingRuleId(rule.id)
    window.speechSynthesis.speak(utterance)
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const handleDownloadPDF = (ruleTitle: string) => {
    alert(`Mock PDF download initiated for document: ${ruleTitle}.pdf`)
  }

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || rule.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-90 h-90 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-emerald-400">Village Rulebook & Guidelines</h1>

        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
          📖
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Search and bookmarked count */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search specific rules or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-300">
            <Bookmark className="w-4 h-4 text-emerald-500" />
            <span>Bookmarked Rules: {bookmarkedRuleIds.length}</span>
          </div>
        </section>

        {/* Category Horizontal Selector */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-2 px-3.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </section>

        {/* Rules Cards Feed */}
        <section className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRules.map((rule) => {
              const isBookmarked = bookmarkedRuleIds.includes(rule.id)
              const isSpeaking = speakingRuleId === rule.id

              return (
                <motion.div
                  key={rule.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 backdrop-blur-sm shadow-md space-y-4 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        Effective: {rule.effectiveDate}
                      </span>
                      <h3 className="font-poppins font-bold text-base text-slate-200">
                        {rule.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleSpeakRule(rule, e)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-red-500/10 border-red-500 text-red-400'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                        title="Read Aloud"
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={(e) => handleToggleBookmark(rule.id, e)}
                        className="p-2 rounded-lg border bg-slate-950 border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Bookmark Rule"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                    {rule.content}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-red-400 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>Penalty: {rule.penalty}</span>
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(rule.title)}
                      className="py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 w-fit cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Download PDF Notice
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}
