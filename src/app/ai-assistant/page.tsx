'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  HelpCircle,
  CornerDownRight,
  MessageSquare,
} from 'lucide-react'

interface Message {
  sender: 'user' | 'ai'
  text: string
  timestamp: string
}

export default function AIVoiceAssistant() {
  const navigate = useNavigate()
  
  // Interactive assistant states
  const [messages, setMessages] = React.useState<Message[]>([
    { sender: 'ai', text: 'Namaste! I am GramVoice AI. How can I help you today? You can ask me about local schemes, shop timings, or report an issue.', timestamp: 'Just now' },
  ])
  const [inputText, setInputText] = React.useState('')
  const [isListening, setIsListening] = React.useState(false)
  const [speakResponses, setSpeakResponses] = React.useState(true)
  
  // Waveform heights for speech animation
  const [orbWave, setOrbWave] = React.useState<number[]>(Array(10).fill(15))
  const waveIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const suggestions = [
    'How do I apply for PM-Kisan scheme?',
    'Is the Cooperative Ration store open now?',
    'Report a water pipeline leakage near school street.',
    'Find emergency contact details of Ward 3 officer.',
  ]

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { sender: 'user', text, timestamp: timeString }
    
    setMessages((prev) => [...prev, userMsg])
    setInputText('')

    // Simulate AI thinking and replying
    setTimeout(() => {
      let aiText: string
      if (text.toLowerCase().includes('kisan')) {
        aiText = 'The PM-Kisan scheme provides ₹6,000 per year. You can apply directly through our Schemes section. You will need your Land deeds, Aadhaar card, and Bank passbook.'
      } else if (text.toLowerCase().includes('ration') || text.toLowerCase().includes('cooperative')) {
        aiText = 'The Cooperative Ration Shop is open from 8:00 AM to 6:00 PM today. It is located at Main Chowk. It is currently OPEN.'
      } else if (text.toLowerCase().includes('water') || text.toLowerCase().includes('leakage')) {
        aiText = 'I have formatted a complaint for "Water Pipeline Leakage". Tap "Record Complaint" from dashboard or submit your details to file the official ticket.'
      } else if (text.toLowerCase().includes('officer') || text.toLowerCase().includes('ward 3')) {
        aiText = 'The Emergency Coordinator for Ward 3 is Officer Selvam. His contact number is +91 98765 09210.'
      } else {
        aiText = `Thank you for asking. I am processing your query: "${text}". You can register this as a voice complaint, check local marketplace timings, or view active village schemes.`
      }

      const aiMsg: Message = { sender: 'ai', text: aiText, timestamp: timeString }
      setMessages((prev) => [...prev, aiMsg])

      // Speak answer if enabled
      if (speakResponses) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(aiText)
        window.speechSynthesis.speak(utterance)
      }
    }, 1200)
  }

  // Listening animation simulator
  const startListening = () => {
    window.speechSynthesis.cancel()
    setIsListening(true)
    
    // Waveform animation
    waveIntervalRef.current = setInterval(() => {
      setOrbWave(Array.from({ length: 10 }, () => Math.floor(Math.random() * 45) + 12))
    }, 100)

    // Mock speech timeout
    setTimeout(() => {
      stopListening()
      // Simulate input voice recognized
      const randomPrompt = suggestions[Math.floor(Math.random() * suggestions.length)]
      handleSendMessage(randomPrompt)
    }, 3000)
  }

  const stopListening = () => {
    setIsListening(false)
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current)
      waveIntervalRef.current = null
    }
    setOrbWave(Array(10).fill(15))
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
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

        <div className="flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h1 className="font-poppins font-bold text-base text-slate-200">GramVoice AI Assistant</h1>
        </div>

        <button
          onClick={() => setSpeakResponses(!speakResponses)}
          className={`p-2 rounded-xl border cursor-pointer transition-all ${
            speakResponses
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-slate-900 border-slate-850 text-slate-500'
          }`}
          title={speakResponses ? 'Mute AI Speech' : 'Unmute AI Speech'}
        >
          {speakResponses ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </header>

      {/* Dual Pane Layout (Responsive Grid) */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 grid gap-6 md:grid-cols-12 relative z-10 overflow-hidden">
        
        {/* Left Panel: Suggestion Shortcuts (Hidden or stacked on mobile) */}
        <section className="md:col-span-4 space-y-4 flex flex-col justify-start">
          <div className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm space-y-3.5 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              Suggested AI Prompts
            </h3>

            <div className="space-y-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="w-full text-left p-3 rounded-xl border border-slate-850 bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/25 transition-all text-xs text-slate-300 flex items-start gap-2 cursor-pointer"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex p-5 rounded-3xl border border-slate-900 bg-slate-900/20 text-slate-500 gap-3 text-xs leading-relaxed">
            <MessageSquare className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <p>
              This is a simulated AI Voice Assistant. Tapping suggestions or inputting text triggers mock logic providing tailored localized reports.
            </p>
          </div>
        </section>

        {/* Right Panel: Immersion Chat & Orb */}
        <section className="md:col-span-8 flex flex-col justify-between gap-4 h-[calc(100vh-230px)] md:h-[calc(100vh-200px)]">
          
          {/* Scrollable Conversation Bubbles */}
          <div className="flex-1 overflow-y-auto p-4 rounded-3xl bg-slate-900/20 border border-slate-900/50 space-y-4 max-h-[380px] md:max-h-[none] no-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isAI = msg.sender === 'ai'
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] space-y-1`}>
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow ${
                          isAI
                            ? 'bg-slate-900/70 border border-slate-800 text-slate-200 rounded-bl-none'
                            : 'bg-emerald-600 text-white rounded-br-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className="text-[10px] text-slate-600 font-semibold px-2 text-right">
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Listening Orb & Input block */}
          <div className="space-y-4 bg-slate-950/60 p-3.5 rounded-3xl border border-slate-900 backdrop-blur-md">
            
            {/* Visualizer bars */}
            <div className="flex items-center justify-center gap-1.5 h-12">
              {orbWave.map((h, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: h }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className={`w-1 rounded-full ${isListening ? 'bg-red-500' : 'bg-slate-800'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Orb button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg cursor-pointer transition-colors ${
                  isListening
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/20'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 animate-pulse" />}
              </motion.button>

              {/* Form Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!inputText.trim()) return
                  handleSendMessage(inputText)
                }}
                className="flex-grow flex gap-2"
              >
                <input
                  type="text"
                  placeholder={isListening ? 'Listening your voice...' : 'Type a query or tap suggestion...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isListening}
                  className="flex-grow text-xs sm:text-sm py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-700 disabled:border disabled:border-slate-850 cursor-pointer shrink-0 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </section>

      </main>
    </div>
  )
}
