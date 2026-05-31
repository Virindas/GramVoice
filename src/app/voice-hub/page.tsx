'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sliders,
  Mic,
  Languages,
  History,
  Volume2,
  Check,
  Settings,
  Sparkles
} from 'lucide-react'

interface VoiceCommandLog {
  id: string
  timestamp: string
  spokenText: string
  actionTriggered: string
  confidence: number
}

const INITIAL_LOGS: VoiceCommandLog[] = [
  {
    id: 'cmd-1',
    timestamp: 'Today, 10:15 AM',
    spokenText: 'water pipe leakage near street five',
    actionTriggered: 'Redirected to Record Complaint (Category: Water)',
    confidence: 0.98
  },
  {
    id: 'cmd-2',
    timestamp: 'Today, 09:42 AM',
    spokenText: 'check my ration card application status',
    actionTriggered: 'Opened Track Complaint (GV-8898)',
    confidence: 0.94
  },
  {
    id: 'cmd-3',
    timestamp: 'Yesterday, 04:10 PM',
    spokenText: 'when does farmers marketplace open tomorrow',
    actionTriggered: 'Opened Marketplace Schedule (Morning: 7AM)',
    confidence: 0.89
  }
]

export default function VoiceHub() {
  const navigate = useNavigate()
  const [logs, setLogs] = React.useState<VoiceCommandLog[]>(INITIAL_LOGS)
  const [sensitivity, setSensitivity] = React.useState(75)
  const [speed, setSpeed] = React.useState(1.0)
  const [selectedVoice, setSelectedVoice] = React.useState('hi-female')
  const [primaryLang, setPrimaryLang] = React.useState('hi')
  
  // Waveform animation helper state
  const [isListening, setIsListening] = React.useState(false)
  const [waveformBars, setWaveformBars] = React.useState<number[]>(Array(18).fill(10))
  const [listeningText, setListeningText] = React.useState('')
  const [hasRecordedNewCommand, setHasRecordedNewCommand] = React.useState(false)

  // Web Audio Synth demo
  const handleTestAudio = () => {
    window.speechSynthesis.cancel()
    let text = 'नमस्ते, मैं ग्रामवॉइस सहायक हूँ। आपका स्वागत है।'
    let langCode = 'hi-IN'

    if (primaryLang === 'en') {
      text = 'Hello, this is the GramVoice assistant test speech.'
      langCode = 'en-US'
    } else if (primaryLang === 'ta') {
      text = 'வணக்கம், நான் கிராம் வாய்ஸ் குரல் உதவியாளர்.'
      langCode = 'ta-IN'
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode
    utterance.rate = speed
    window.speechSynthesis.speak(utterance)
  }

  // Waveform simulation effect
  React.useEffect(() => {
    let timer: any
    if (isListening) {
      timer = setInterval(() => {
        setWaveformBars(
          Array(18)
            .fill(0)
            .map(() => Math.floor(Math.random() * 50) + 15)
        )
      }, 100)
    } else {
      setWaveformBars(Array(18).fill(8))
    }
    return () => clearInterval(timer)
  }, [isListening])

  const handleStartListeningSim = () => {
    if (isListening) {
      // stop listening and process
      setIsListening(false)
      const mockPhrases = [
        { text: 'street light bulb fused ward three', action: 'Drafted Complaint (Category: Lights)' },
        { text: 'show me government scheme for housing', action: 'Opened PM Awas Yojana Schemes' },
        { text: 'call panchayat pradhan office emergency', action: 'Opened Contacts (Pradhan phone dialer)' }
      ]
      const chosen = mockPhrases[Math.floor(Math.random() * mockPhrases.length)]
      setListeningText(`"${chosen.text}"`)
      
      const newLog: VoiceCommandLog = {
        id: `cmd-${Date.now()}`,
        timestamp: 'Just Now',
        spokenText: chosen.text,
        actionTriggered: chosen.action,
        confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(2))
      }
      
      setTimeout(() => {
        setLogs(prev => [newLog, ...prev])
        setListeningText('')
        setHasRecordedNewCommand(true)
        setTimeout(() => setHasRecordedNewCommand(false), 3000)
      }, 1200)
    } else {
      setIsListening(true)
      setListeningText('Listening for your speech...')
    }
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-90 h-90 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-teal-400 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-500" />
          <span>Multi-Language Voice Hub</span>
        </h1>

        <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-sm">
          🎙️
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Voice Visualizer Orb Card */}
        <section className="p-6 rounded-3xl border border-slate-850 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center text-center gap-6 relative">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 animate-pulse" />
            AI Speech Recognition Engine
          </div>

          <div className="space-y-1.5 mt-4">
            <h2 className="text-xl sm:text-2xl font-poppins font-extrabold text-slate-200">
              Interactive Speech Assistant
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tap the microphone to speak your query. GramVoice translates and routes it to public services.
            </p>
          </div>

          {/* Waveform Visualizer */}
          <div className="h-16 flex items-center justify-center gap-1 w-full max-w-xs px-4 bg-slate-950/50 rounded-2xl border border-slate-900">
            {waveformBars.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: h }}
                className={`w-2.5 rounded-full ${
                  isListening 
                    ? 'bg-gradient-to-t from-teal-500 to-emerald-400 shadow-lg shadow-teal-500/20' 
                    : 'bg-slate-800'
                }`}
                style={{ minHeight: '6px' }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              />
            ))}
          </div>

          <p className="text-xs text-slate-300 italic min-h-[1.5rem] font-medium font-poppins">
            {listeningText || 'Ready to listen... Tap button below'}
          </p>

          {/* Trigger Mic button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartListeningSim}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer transition-all border-2 border-slate-950 ${
              isListening
                ? 'bg-gradient-to-r from-red-600 to-rose-600 animate-pulse shadow-red-500/10'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-teal-500/10'
            }`}
          >
            <Mic className={`w-7 h-7 ${isListening ? 'animate-bounce' : ''}`} />
          </motion.button>

          {hasRecordedNewCommand && (
            <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-xl">
              ✓ Processed Speech Command Added to History
            </div>
          )}
        </section>

        {/* Audio Configuration Settings */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Sensitivity & Speeds sliders */}
          <div className="p-5 rounded-3xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
              <Settings className="w-4 h-4 text-teal-500" />
              Voice Controls & Thresholds
            </h3>

            <div className="space-y-4 text-xs">
              {/* Mic sensitivity */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Speech Sensitivity</span>
                  <span className="text-teal-400 font-mono">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
                <span className="text-[10px] text-slate-500 block">Higher settings allow recognition in noisy outdoor environments.</span>
              </div>

              {/* Playback speed */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Voice Synthesis Rate</span>
                  <span className="text-teal-400 font-mono">{speed}x Speed</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
                <span className="text-[10px] text-slate-500 block">Control the speed of government scheme announcements.</span>
              </div>

              {/* Test Button */}
              <button
                onClick={handleTestAudio}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/50 font-poppins font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Listen to Test Announcement
              </button>
            </div>
          </div>

          {/* Accent & Language Choices */}
          <div className="p-5 rounded-3xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
              <Languages className="w-4 h-4 text-teal-500" />
              Language & Accent Presets
            </h3>

            <div className="space-y-4 text-xs">
              {/* Primary Language */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">Speech Recognition Language</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
                  {[
                    { val: 'hi', label: 'हिन्दी' },
                    { val: 'en', label: 'English' },
                    { val: 'ta', label: 'தமிழ்' }
                  ].map((langOpt) => (
                    <button
                      key={langOpt.val}
                      type="button"
                      onClick={() => setPrimaryLang(langOpt.val)}
                      className={`py-1.5 px-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer ${
                        primaryLang === langOpt.val
                          ? 'bg-slate-905 text-teal-400 shadow-inner'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {langOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Gender Accent */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">Assistant Accent Preset</label>
                <div className="space-y-2">
                  {[
                    { val: 'hi-female', label: 'Female Voice (Standard Regional Accent)' },
                    { val: 'hi-male', label: 'Male Voice (Clear Public Announcement)' },
                    { val: 'regional-rural', label: 'Dehat/Rural Hindi Pronunciation Support' }
                  ].map((voiceOpt) => (
                    <div
                      key={voiceOpt.val}
                      onClick={() => setSelectedVoice(voiceOpt.val)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedVoice === voiceOpt.val
                          ? 'border-teal-500/40 bg-teal-500/5 text-teal-400 font-bold'
                          : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{voiceOpt.label}</span>
                      {selectedVoice === voiceOpt.val && <Check className="w-4 h-4 text-teal-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* History log of voice commands */}
        <section className="p-5 rounded-3xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
            <History className="w-4 h-4 text-teal-500" />
            Recent Speech-to-Text Command Log
          </h3>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 flex flex-col sm:flex-row justify-between gap-3 text-xs leading-relaxed"
              >
                <div className="space-y-1">
                  <p className="italic text-slate-300 font-medium font-mono">
                    &quot;{log.spokenText}&quot;
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Action: <span className="text-slate-400 font-semibold">{log.actionTriggered}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center shrink-0 gap-1">
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-mono font-bold">
                    {Math.round(log.confidence * 100)}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
