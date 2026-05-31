'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Mic,
  ArrowLeft,
  Volume2,
  Check,
  Lightbulb,
  CornerDownRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'
export default function RecordComplaint() {
  const navigate = useNavigate()
  const [lang, setLang] = React.useState('en')
  const [category, setCategory] = React.useState('water')
  const [recordState, setRecordState] = React.useState<'idle' | 'recording' | 'finished'>('idle')
  const [seconds, setSeconds] = React.useState(0)
  const [transcription, setTranscription] = React.useState('')
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Waveform bars height multipliers
  const [waveHeights, setWaveHeights] = React.useState<number[]>(Array(15).fill(10))

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const waveRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  // Web Speech API Refs
  const recognitionRef = React.useRef<any>(null)
  const isListeningRef = React.useRef(false)

  const startTimer = React.useCallback(() => {
    setSeconds(0)
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startWave = React.useCallback(() => {
    waveRef.current = setInterval(() => {
      setWaveHeights(
        Array.from({ length: 15 }, () => Math.floor(Math.random() * 45) + 10)
      )
    }, 120)
  }, [])

  const stopWave = React.useCallback(() => {
    if (waveRef.current) {
      clearInterval(waveRef.current)
      waveRef.current = null
    }
    setWaveHeights(Array(15).fill(10))
  }, [])

  const handleStopRecordSilently = React.useCallback(() => {
    setRecordState('idle')
    isListeningRef.current = false
    stopTimer()
    stopWave()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('Failed to silently stop recognition:', err)
      }
    }
  }, [stopTimer, stopWave])

  // Initialize SpeechRecognition on mount based on user session language
  React.useEffect(() => {
    const session = getUser()
    if (session) {
      const codeMapReverse: Record<string, string> = {
        'English': 'en',
        'हिन्दी': 'hi',
        'தமிழ்': 'ta'
      }
      setLang(codeMapReverse[session.language] || 'en')
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true

      rec.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript
        }
        if (finalTranscript.trim()) {
          setTranscription(finalTranscript)
        }
      }

      rec.onerror = (event: any) => {
        console.error('Speech recognition error event:', event.error)
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please check your browser permissions.')
          handleStopRecordSilently()
        } else if (event.error === 'no-speech') {
          // Silent handler
        } else if (event.error === 'network') {
          toast.error('Network connectivity issues encountered. Transcription paused.')
          handleStopRecordSilently()
        }
      }

      rec.onend = () => {
        // Safe restart if recording state is active
        if (isListeningRef.current) {
          try {
            rec.start()
          } catch (err) {
            console.error('Failed to restart speech recognition:', err)
          }
        }
      }

      recognitionRef.current = rec
    }

    return () => {
      isListeningRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveRef.current) clearInterval(waveRef.current)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [handleStopRecordSilently])

  // Sync language selection dynamically
  React.useEffect(() => {
    if (recognitionRef.current) {
      const codeMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        ta: 'ta-IN'
      }
      recognitionRef.current.lang = codeMap[lang] || 'en-US'
      if (isListeningRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          console.error('Failed to stop during language sync:', err)
        }
      }
    }
  }, [lang])

  const handleStartRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Web Speech API is not supported in this browser. Please type your complaint manually.')
      setRecordState('finished')
      setTranscription('')
      return
    }

    setRecordState('recording')
    setTranscription('')
    setAudioUrl(null)
    isListeningRef.current = true
    startTimer()
    startWave()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        toast.info('Listening for complaint voice feed...')
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
      }
    }
  }

  const handleStopRecord = () => {
    setRecordState('finished')
    isListeningRef.current = false
    stopTimer()
    stopWave()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('Failed to stop speech recognition:', err)
      }
    }
    setAudioUrl('live_voice_memo.wav')
    toast.success('Speech-to-text transcription ready!')
  }

  const handleRetry = () => {
    setRecordState('idle')
    setSeconds(0)
    setTranscription('')
    setAudioUrl(null)
  }

  const handleSubmit = async () => {
    const session = getUser()
    if (!session) {
      alert('Session expired. Please log in again.')
      navigate('/login')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert([{
          user_id: session.id,
          category,
          transcript: transcription || 'Voice complaint filed.',
          status: 'Pending',
          priority: 'Medium'
        }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        navigate(`/track-complaint?id=${data.id}`)
      }
    } catch (err) {
      console.error('Error saving complaint:', err)
      alert('Failed to submit complaint. Please check your internet connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedTime = () => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const categories = [
    { id: 'water', label: 'Water Supply', icon: '🚰' },
    { id: 'electricity', label: 'Electricity / Light', icon: '💡' },
    { id: 'roads', label: 'Road Repair', icon: '🛣️' },
    { id: 'sanitation', label: 'Sanitation', icon: '🧹' },
    { id: 'health', label: 'Health Service', icon: '🏥' },
    { id: 'agri', label: 'Agriculture', icon: '🚜' },
  ]

  const suggestionsDict: Record<string, string[]> = {
    en: [
      'State your name and Ward number clearly.',
      'Specify the landmark of the leakage or problem.',
      'Mention how long this issue has been active.',
    ],
    hi: [
      'अपना नाम और वार्ड नंबर स्पष्ट रूप से बताएं।',
      'समस्या या पाइप रिसाव के स्थान का उल्लेख करें।',
      'बताएं कि यह समस्या कितने समय से है।',
    ],
    ta: [
      'உங்கள் பெயர் மற்றும் வார்டு எண்ணை தெளிவாக கூறவும்.',
      'புகாரின் முக்கிய அடையாளத்தை குறிப்பிடவும்.',
      'இந்த பிரச்சனை எவ்வளவு நாட்களாக உள்ளது என கூறவும்.',
    ],
  }
  const suggestions = suggestionsDict[lang] || suggestionsDict.en

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/villager-dashboard')}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-sm">Dashboard</span>
        </button>

        <h1 className="font-poppins font-bold text-lg text-emerald-600">Panchayat Recording Studio</h1>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="ta">தமிழ்</option>
        </select>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col justify-center gap-8 relative z-10">
        {/* Category Picker */}
        <section className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-center sm:text-left">
            Select Issue Department
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  category === cat.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                    : 'border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xl sm:text-2xl">{cat.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Center Orb Section */}
        <section className="flex flex-col items-center justify-center gap-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Pulsing waves */}
            <AnimatePresence>
              {recordState === 'recording' && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border border-emerald-500 bg-emerald-500/5 pointer-events-none"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                    className="absolute inset-0 rounded-full border border-emerald-500 bg-emerald-500/5 pointer-events-none"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Inner Main Orb */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={recordState === 'idle' ? handleStartRecord : recordState === 'recording' ? handleStopRecord : undefined}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl relative z-10 cursor-pointer ${
                recordState === 'recording'
                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-red-500/20'
                  : recordState === 'finished'
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-emerald-500/20 cursor-default'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
              }`}
            >
              {recordState === 'recording' ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"
                  />
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Stop</span>
                </>
              ) : recordState === 'finished' ? (
                <>
                  <Check className="w-12 h-12" />
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Recorded</span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Tap to Speak</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Timer or Status Text */}
          <div className="text-center space-y-1">
            {recordState === 'recording' ? (
              <h3 className="font-mono text-2xl font-bold text-red-500 tracking-wider">
                {formattedTime()}
              </h3>
            ) : (
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-base text-slate-705 font-poppins font-bold">
                  {recordState === 'finished' ? 'Recording Completed' : 'Speak to report your complaint'}
                </h3>
                {recordState === 'finished' && audioUrl && (
                  <p className="text-xs text-slate-500 font-mono">
                    Audio File: {audioUrl}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-sm">
            {waveHeights.map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: h }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-1.5 rounded-full ${
                  recordState === 'recording' ? 'bg-red-500' : recordState === 'finished' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Mock speech-to-text Transcription Box */}
        <AnimatePresence>
          {recordState !== 'idle' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white/80 border border-slate-200 p-5 rounded-3xl space-y-3 relative shadow-inner"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  Real-time AI Transcription Preview
                </span>
                <span className="font-mono">{formattedTime()}</span>
              </div>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Transcribing your voice. Speak now or type your complaint manually..."
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-800 dark:text-slate-100 font-sans leading-relaxed focus:border-emerald-500 focus:outline-none transition-colors min-h-[100px] resize-y"
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* AI helper hints */}
        <section className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 flex gap-3 text-xs">
          <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-700">Tips for quick Panchayat response:</h4>
            <ul className="list-none space-y-1 text-slate-600">
              {suggestions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Footer controls */}
      <footer className="relative z-10 px-4 py-4 sm:px-6 border-t border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-end gap-3">
          {recordState !== 'idle' && (
            <button
              onClick={handleRetry}
              className="px-5 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-350 text-slate-600 font-poppins font-semibold text-sm cursor-pointer select-none text-center"
            >
              Retry
            </button>
          )}
          <button
            onClick={recordState === 'finished' ? handleSubmit : () => navigate('/villager-dashboard')}
            disabled={isSubmitting}
            className={`flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl font-poppins font-bold text-sm select-none text-center shadow-lg transition-all cursor-pointer ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400'
                : recordState === 'finished'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 hover:shadow-xl'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
          >
            {isSubmitting ? 'Submitting...' : recordState === 'finished' ? 'Submit Complaint' : 'Cancel'}
          </button>
        </div>
      </footer>
    </div>
  )
}
