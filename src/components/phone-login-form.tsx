'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { saveUser } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

interface PhoneLoginProps {
  onSubmit?: (phone: string, role: 'villager' | 'admin', address?: string) => void
  role?: 'villager' | 'admin'
}

export function PhoneLoginForm({ onSubmit, role = 'villager' }: PhoneLoginProps) {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [language, setLanguage] = React.useState('English')
  const [isLoading, setIsLoading] = React.useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Restrict to numeric characters only
    const numericValue = value.replace(/\D/g, '')
    // Prevent typing more than 10 digits
    if (numericValue.length <= 10) {
      setPhone(numericValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isPhoneValid = phone.length === 10
    const isFormValid = name.trim() !== '' && isPhoneValid && address.trim() !== ''
    if (!isFormValid) return
    
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
            role: role,
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
        role: role,
        language,
        address
      })

      // Inform parent component if listener is passed
      onSubmit?.(`+91 ${phone}`, role, address)

      // Redirect directly to dashboard
      navigate('/villager-dashboard')
    } catch (err) {
      console.error('Login error, using local fallback:', err)
      // Save locally as a robust fallback
      saveUser({
        id: crypto.randomUUID(),
        name,
        phone,
        role: role,
        language,
        address
      })
      
      onSubmit?.(`+91 ${phone}`, role, address)
      navigate('/villager-dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const isInvalid = phone.length > 0 && phone.length < 10
  const isValid = phone.length === 10
  const isFormValid = name.trim() !== '' && isValid && address.trim() !== ''

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md space-y-4 text-xs sm:text-sm"
    >
      {/* Name Input */}
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
          disabled={isLoading}
        />
      </div>

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 dark:text-slate-400 font-mono pointer-events-none select-none">
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
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center">
            {isValid && (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
            )}
            {isInvalid && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        <div className="h-4 flex items-center">
          {isInvalid && (
            <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
              Phone number must be exactly 10 digits (entered {phone.length}/10)
            </p>
          )}
          {isValid && (
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              Valid phone number. Ready to login!
            </p>
          )}
          {!phone && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your 10-digit mobile number to access your account
            </p>
          )}
        </div>
      </div>

      {/* Address Input */}
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
          disabled={isLoading}
        />
      </div>

      {/* Language Selector */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Interface Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-semibold"
          disabled={isLoading}
        >
          <option value="English">English</option>
          <option value="हिन्दी">हिन्दी (Hindi)</option>
          <option value="தமிழ்">தமிழ் (Tamil)</option>
        </select>
      </div>

      <motion.div
        whileHover={isFormValid ? { scale: 1.02 } : {}}
        whileTap={isFormValid ? { scale: 0.98 } : {}}
        className="pt-2"
      >
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-poppins font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Accessing Portal...' : 'Continue to Dashboard'}
        </button>
      </motion.div>
    </motion.form>
  )
}
