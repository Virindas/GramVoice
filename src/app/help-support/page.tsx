'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Volume2,
  VolumeX,
  Send,
  BookOpen,
  ChevronDown,
  Layers,
} from 'lucide-react'

interface FAQ {
  q: string
  a: string
  voiceText: string
}

export default function HelpSupport() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [expandedFaqIdx, setExpandedFaqIdx] = React.useState<number | null>(null)
  
  // Interactive Chatbot mockup
  const [chatLog, setChatLog] = React.useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am GramVoice Support Agent. Type or ask any support question.' },
  ])
  const [chatText, setChatText] = React.useState('')
  const [isSpeakingBot, setIsSpeakingBot] = React.useState(false)

  const faqs: FAQ[] = [
    {
      q: 'How do I submit a voice complaint?',
      a: 'Go to Villager Dashboard, tap "Record Voice Complaint", select your issue department, tap the Microphone button, speak clearly, and tap "Submit Complaint".',
      voiceText: 'To submit a voice complaint, tap the record complaint button on dashboard, record your voice, and submit.',
    },
    {
      q: 'What is the Emergency SOS button?',
      a: 'The Emergency SOS button instantly dials public safety contacts like Police, Ambulance, and Fire, while broadcasting your live coordinates to Ward volunteers.',
      voiceText: 'Emergency SOS button dials ambulances and police, and shares coordinates with volunteers.',
    },
    {
      q: 'How do I apply for government schemes?',
      a: 'Select "Government Schemes" from the dashboard, choose your category (e.g. Agriculture), click "Apply Now" on the scheme card, and fill in your details.',
      voiceText: 'Go to schemes, click apply, and enter Aadhaar details to apply.',
    },
    {
      q: 'How do I change application text size?',
      a: 'Go to "Profile" (User icon in bottom navigation), find the "Text Font Size" section, and click your preferred scale (SM, MD, LG, XL).',
      voiceText: 'Change font size under Profile settings by selecting SM, MD, LG, or XL.',
    },
  ]

  const handleToggleFaq = (idx: number) => {
    setExpandedFaqIdx(expandedFaqIdx === idx ? null : idx)
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatText.trim()) return

    const newLog = [...chatLog, { sender: 'user', text: chatText } as const]
    setChatLog(newLog)
    setChatText('')

    setTimeout(() => {
      let reply = 'Thank you for contacting support. You can read our guidelines, check the contacts directory, or record a direct Panchayat complaint.'
      const userTxt = chatText.toLowerCase()
      
      if (userTxt.includes('size') || userTxt.includes('font')) {
        reply = 'You can adjust font size in the Profile tab settings.'
      } else if (userTxt.includes('scheme') || userTxt.includes('apply')) {
        reply = 'Explore and apply for PM-Kisan and Awas schemes directly in the Schemes section.'
      } else if (userTxt.includes('water') || userTxt.includes('tanker')) {
        reply = 'Go to Service Requests to book water tankers and track repair dispatches.'
      }

      setChatLog([...newLog, { sender: 'bot', text: reply }])

      // Speech synthesis
      if (isSpeakingBot) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(reply)
        window.speechSynthesis.speak(utterance)
      }
    }, 1000)
  }

  const speakFaq = (faq: FAQ, e: React.MouseEvent) => {
    e.stopPropagation()
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(faq.voiceText)
    window.speechSynthesis.speak(utterance)
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const filteredFaqs = faqs.filter((f) =>
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-90 h-90 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-emerald-400">Help & Support</h1>

        <button
          onClick={() => setIsSpeakingBot(!isSpeakingBot)}
          className={`p-2 rounded-xl border cursor-pointer transition-all ${
            isSpeakingBot
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-slate-900 border-slate-850 text-slate-500'
          }`}
          title={isSpeakingBot ? 'Mute Guide' : 'Unmute Guide'}
        >
          {isSpeakingBot ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Grid Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-6 grid gap-6 md:grid-cols-12 relative z-10">
        
        {/* Left: Frequently Asked Questions (FAQ) */}
        <section className="md:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Frequently Asked Questions
              </h3>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-650 focus:border-emerald-500 focus:outline-none transition-colors text-xs"
              />
            </div>

            {/* FAQ List Accordions */}
            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaqIdx === idx
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-855 bg-slate-950/40 overflow-hidden"
                  >
                    <button
                      onClick={() => handleToggleFaq(idx)}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-3 font-semibold text-xs text-slate-200 cursor-pointer"
                    >
                      <span className="font-poppins">{faq.q}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => speakFaq(faq, e)}
                          className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                          title="Speak FAQ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="p-3.5 border-t border-slate-900/60 text-xs text-slate-400 leading-relaxed bg-slate-900/20">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

          {/* User Onboarding Guides */}
          <div className="p-5 rounded-3xl border border-slate-900 bg-slate-900/20 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Onboarding & Accessibility Tutorials
            </h4>
            <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1">
                <p className="font-bold text-slate-200">🔊 Speak-on-Hover Guide</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Turn on the Voice Readout setting in the Profile menu. Hovering over cards automatically reads their content out loud.
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1">
                <p className="font-bold text-slate-200">📱 Mobile APK Compatibility</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  All UI modules support Capacitor plugins. You can compile this app cleanly into an Android APK package.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Support Chatbot */}
        <section className="md:col-span-5 flex flex-col h-[400px] md:h-[450px]">
          <div className="flex-grow flex flex-col justify-between border border-slate-900 bg-slate-900/30 rounded-3xl overflow-hidden shadow-md">
            
            {/* Chatbot Header */}
            <div className="bg-slate-950/50 border-b border-slate-900 p-3.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
                🤖
              </div>
              <div>
                <h4 className="font-poppins font-bold text-xs text-slate-200">Support Helper Chatbot</h4>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Automated Panchayat AI</p>
              </div>
            </div>

            {/* Chatbot messages log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar max-h-[220px] md:max-h-[none]">
              {chatLog.map((chat, idx) => {
                const isBot = chat.sender === 'bot'
                return (
                  <div
                    key={idx}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-[11px] sm:text-xs leading-relaxed shadow-sm ${
                        isBot
                          ? 'bg-slate-950 border border-slate-850 text-slate-300 rounded-bl-none'
                          : 'bg-emerald-600 text-white rounded-br-none'
                      }`}
                    >
                      {chat.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chat Input form */}
            <form
              onSubmit={handleSendChat}
              className="p-3 border-t border-slate-900 bg-slate-950/50 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask chatbot..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-grow text-xs py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-850 text-slate-100 placeholder-slate-650 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-900 disabled:text-slate-600 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

      </main>
    </div>
  )
}
