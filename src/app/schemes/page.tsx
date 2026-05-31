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
  CheckCircle,
  HelpCircle,
  FileText,
  User,
  Phone,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface Scheme {
  id: string
  title: string
  category: 'agri' | 'women' | 'edu' | 'health' | 'job'
  desc: string
  benefits: string
  eligibility: string
  docUrl: string
  subsidy: string
}

const SCHEMES_DATA: Scheme[] = [
  {
    id: 'SCH-Kisan',
    title: 'PM-Kisan Samman Nidhi',
    category: 'agri',
    desc: 'Income support of ₹6,000 per year in three equal installments to all landholding farmer families.',
    benefits: '₹6,000 per year directly to bank account',
    eligibility: 'Small and marginal landholder farmer families',
    docUrl: 'Land deeds, Aadhaar, Bank passbook',
    subsidy: '100% Gov Funded',
  },
  {
    id: 'SCH-Awas',
    title: 'Pradhan Mantri Awas Yojana',
    category: 'women',
    desc: 'Provides central assistance to implementing agencies for providing houses to all eligible families.',
    benefits: 'Financial assistance of ₹1.2 Lakhs for housing construction',
    eligibility: 'Families living in kutcha/damaged houses, prioritized by female ownership',
    docUrl: 'Aadhaar, income certificate, caste certificate',
    subsidy: 'Subsidy on Loan Interest',
  },
  {
    id: 'SCH-Ladli',
    title: 'Ladli Behna Yojana',
    category: 'women',
    desc: 'Enhances economic independence of women, improving their health and nutrition levels.',
    benefits: '₹1,250 monthly transfer to eligible women',
    eligibility: 'Married women aged 21-60 years with family income below ₹2.5 Lakhs',
    docUrl: 'Samagra ID, Aadhaar, bank account details',
    subsidy: 'Direct Cash Transfer',
  },
  {
    id: 'SCH-Scholar',
    title: 'Panchayat Post-Matric Scholarship',
    category: 'edu',
    desc: 'Scholarships to students from low-income rural households for pursuing higher education.',
    benefits: '100% tuition fee waiver and monthly allowance of ₹800',
    eligibility: 'Students from village wards enrolled in accredited colleges',
    docUrl: 'Marksheets, fee receipts, income certificate',
    subsidy: 'Full Waiver',
  },
  {
    id: 'SCH-Health',
    title: 'Ayushman Bharat Card',
    category: 'health',
    desc: 'Health insurance cover of ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.',
    benefits: 'Cashless treatment at all empaneled public & private hospitals',
    eligibility: 'Identified families under Socio-Economic Caste Census (SECC)',
    docUrl: 'Aadhaar, ration card, PM Letter',
    subsidy: '₹5 Lakhs Insurance',
  },
  {
    id: 'SCH-Rojgar',
    title: 'MGNREGA Rural Job Card',
    category: 'job',
    desc: 'Guarantees at least 100 days of wage employment in a financial year to every rural household.',
    benefits: 'Guaranteed local wage work and timely wage payments',
    eligibility: 'Adult members of rural households willing to do unskilled manual work',
    docUrl: 'Aadhaar, photo registration, bank account details',
    subsidy: 'Guaranteed Wages',
  },
]

export default function GovernmentSchemes() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [savedSchemeIds, setSavedSchemeIds] = React.useState<string[]>([])
  const [speakingSchemeId, setSpeakingSchemeId] = React.useState<string | null>(null)
  
  // Apply Modal state
  const [selectedScheme, setSelectedScheme] = React.useState<Scheme | null>(null)
  const [applicantName, setApplicantName] = React.useState('')
  const [applicantAadhaar, setApplicantAadhaar] = React.useState('')
  const [applyStep, setApplyStep] = React.useState<'form' | 'success'>('form')

  const categories = [
    { id: 'all', label: 'All Schemes', icon: Layers },
    { id: 'agri', label: 'Agriculture', icon: Sparkles },
    { id: 'women', label: 'Women Welfare', icon: User },
    { id: 'edu', label: 'Education', icon: FileText },
    { id: 'health', label: 'Healthcare', icon: HelpCircle },
    { id: 'job', label: 'Employment', icon: Phone },
  ]

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedSchemeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Voice assisted reader using HTML5 SpeechSynthesis
  const speakSchemeDetails = (scheme: Scheme, e: React.MouseEvent) => {
    e.stopPropagation()
    if (speakingSchemeId === scheme.id) {
      window.speechSynthesis.cancel()
      setSpeakingSchemeId(null)
      return
    }

    window.speechSynthesis.cancel()
    const textToSpeak = `Scheme Name: ${scheme.title}. Eligibility: ${scheme.eligibility}. Benefits: ${scheme.benefits}.`
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    utterance.onend = () => {
      setSpeakingSchemeId(null)
    }
    
    utterance.onerror = () => {
      setSpeakingSchemeId(null)
    }

    setSpeakingSchemeId(scheme.id)
    window.speechSynthesis.speak(utterance)
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const filteredSchemes = SCHEMES_DATA.filter((scheme) => {
    const matchesSearch =
      scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.desc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || scheme.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applicantName.trim() || applicantAadhaar.length < 12) return
    setApplyStep('success')
  }

  const handleCloseModal = () => {
    setSelectedScheme(null)
    setApplicantName('')
    setApplicantAadhaar('')
    setApplyStep('form')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-emerald-400">Panchayat Welfare Schemes</h1>

        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
          🏛️
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Search and Saved counter */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search scheme name or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-300">
            <Bookmark className="w-4 h-4 text-yellow-500" />
            <span>Saved Schemes: {savedSchemeIds.length}</span>
          </div>
        </section>

        {/* Category horizontal scroller */}
        <section className="overflow-x-auto pb-1.5 flex gap-2 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </section>

        {/* Schemes Grid */}
        <section className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredSchemes.map((scheme) => {
              const isSaved = savedSchemeIds.includes(scheme.id)
              const isSpeaking = speakingSchemeId === scheme.id

              return (
                <motion.div
                  key={scheme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 backdrop-blur-sm shadow-lg flex flex-col justify-between gap-5 relative transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-lg">
                        {scheme.subsidy}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => speakSchemeDetails(scheme, e)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-red-500/10 border-red-500 text-red-400'
                              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                          }`}
                          title="Voice Reader Assistant"
                        >
                          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => handleToggleSave(scheme.id, e)}
                          className="p-1.5 rounded-lg border bg-slate-900 border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-poppins font-bold text-slate-200">
                      {scheme.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {scheme.desc}
                    </p>

                    <div className="pt-2.5 border-t border-slate-800/50 space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold">Benefit: </span>
                        <span className="text-emerald-400 font-semibold">{scheme.benefits}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">Eligibility: </span>
                        <span className="text-slate-300">{scheme.eligibility}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-poppins font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-emerald-500/10 transition-all select-none"
                  >
                    Apply for Benefits
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </section>
      </main>

      {/* Application Drawer / Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Panchayat Application</p>
                  <h3 className="font-poppins font-bold text-base text-slate-200">
                    Apply: {selectedScheme.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {applyStep === 'form' ? (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/50 space-y-1.5 text-xs text-slate-400">
                    <p className="font-bold text-slate-300">Required Documents:</p>
                    <p>{selectedScheme.docUrl}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Applicant Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter name as in Aadhaar card"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Aadhaar Card Number
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="12 Digit Aadhaar Number"
                      value={applicantAadhaar}
                      onChange={(e) => setApplicantAadhaar(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-poppins font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  >
                    Submit Scheme Application
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-poppins font-bold text-lg text-slate-200">Application Submitted!</h4>
                    <p className="text-xs text-slate-400">
                      Successfully linked with ID: <span className="font-mono text-emerald-400 font-bold">{selectedScheme.id}-MOCK</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2 px-4">
                      The Panchayat Officer will review your eligibility. You will receive an automated voice updates list soon.
                    </p>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-poppins font-bold text-xs cursor-pointer transition-colors"
                  >
                    Close Portal
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
