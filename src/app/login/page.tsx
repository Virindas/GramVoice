'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Shield, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { saveUser } from '../../lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  
  // Login Role state
  const [isAdminMode, setIsAdminMode] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Villager Form fields
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [language, setLanguage] = React.useState('English')

  // Admin Form fields
  const [adminUser, setAdminUser] = React.useState('')
  const [adminPass, setAdminPass] = React.useState('')
  
  // Validation checks
  const isPhoneValid = phone.length === 10
  const isVillagerFormValid = name.trim() !== '' && isPhoneValid && address.trim() !== ''
  const isAdminFormValid = adminUser.trim() !== '' && adminPass.trim() !== ''

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // limit to digits
    if (value.length <= 10) {
      setPhone(value)
    }
  }

  const handleVillagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVillagerFormValid) return

    setIsLoading(true)
    try {
      // Query if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()

      let userId = crypto.randomUUID()
      
      if (existingUser) {
        userId = existingUser.id
        // Sync name and language updates
        await supabase
          .from('users')
          .update({ name, language })
          .eq('id', userId)
      } else {
        // Create new villager user
        const { data: newUser } = await supabase
          .from('users')
          .insert([{
            name,
            phone,
            role: 'villager',
            language
          }])
          .select()
          .maybeSingle()
        
        if (newUser) {
          userId = newUser.id
        }
      }

      // Save user session locally
      saveUser({
        id: userId,
        name,
        phone,
        role: 'villager',
        language,
        address
      })

      // Redirect directly to dashboard (bypassing OTP verification)
      navigate('/villager-dashboard')
    } catch (err) {
      console.error('Login error, using local fallback:', err)
      // Save locally as a robust fallback
      saveUser({
        id: crypto.randomUUID(),
        name,
        phone,
        role: 'villager',
        language,
        address
      })
      navigate('/villager-dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdminFormValid) return

    if (adminUser.trim() === 'admin' && adminPass.trim() === '1234') {
      saveUser({
        id: 'admin-uuid-0000',
        name: 'Panchayat Officer',
        phone: '9999999999',
        role: 'admin',
        language: 'English',
        address: 'Panchayat Headquarters'
      })
      navigate('/admin-dashboard')
    } else {
      alert('Invalid admin credentials. Hint: use admin / 1234')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link
          to="/landing"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-poppins font-bold text-foreground">
            GramVoice Portal
          </h1>
          <p className="text-sm text-slate-400">
            Smart Voice Governance Platform
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl space-y-6">
          {/* Toggle Tab */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-850">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-2.5 rounded-xl font-poppins text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isAdminMode ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              <User className="w-4 h-4" />
              Villager Login
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-2.5 rounded-xl font-poppins text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isAdminMode ? 'bg-slate-900 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              <Shield className="w-4 h-4" />
              Panchayat Admin
            </button>
          </div>

          {!isAdminMode ? (
            /* Villager Form */
            <form onSubmit={handleVillagerSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono pointer-events-none select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    placeholder="XXXXXXXXXX"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="pl-14 pr-10 w-full py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-gray-400 font-mono tracking-wider focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                  {isPhoneValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Village / Ward Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 3, North Block"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Interface Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-semibold"
                >
                  <option value="English">English</option>
                  <option value="हिन्दी">हिन्दी (Hindi)</option>
                  <option value="தமிழ்">தமிழ் (Tamil)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!isVillagerFormValid || isLoading}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-poppins font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Accessing Portal...' : 'Continue to Dashboard'}
              </button>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Officer Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 'admin'"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Officer Security Code
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter '1234'"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!isAdminFormValid}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-poppins font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Officer Portal Access
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-2">
          <p>
            By accessing GramVoice, you agree to our{' '}
            <Link to="#" className="text-emerald-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="text-emerald-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
