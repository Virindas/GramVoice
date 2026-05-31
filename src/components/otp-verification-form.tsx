'use client'

import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { useState, useEffect, useRef } from 'react'

interface OTPVerificationProps {
  phone?: string
  onVerify?: (otp: string) => void
  onResend?: () => void
}

export function OTPVerificationForm({
  phone = '+91 XXXXXXXXXX',
  onVerify,
  onResend,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const canResend = countdown === 0

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    // Limit to numeric characters only
    const cleanVal = val.replace(/\D/g, '').substring(0, 1)

    const newOtp = [...otp]
    newOtp[index] = cleanVal
    setOtp(newOtp)

    // Shift focus forward if filled
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (otp[index]) {
        // Clear current value
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Clear previous cell and shift focus backward
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    // Restrict to numbers only, up to 6 digits
    const numbers = pastedData.replace(/\D/g, '').substring(0, 6)
    if (numbers.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < 6; i++) {
        newOtp[i] = numbers[i] || ''
      }
      setOtp(newOtp)
      // Focus on the next unfilled index or the last one
      const focusIndex = Math.min(numbers.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleVerify = () => {
    const otpString = otp.join('')
    setIsLoading(true)
    setTimeout(() => {
      onVerify?.(otpString)
      setIsLoading(false)
    }, 500)
  }

  const handleResend = () => {
    setCountdown(60)
    setOtp(Array(6).fill(''))
    onResend?.()
  }

  const isOtpComplete = otp.join('').length === 6

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md space-y-8"
    >
      {/* OTP Input Section */}
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-poppins font-semibold text-foreground">
            Verify Your Number
          </h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a 6-digit code to {phone}
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-1.5 sm:gap-3 py-4">
          {otp.map((value, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <input
                ref={(el) => {
                  inputRefs.current[i] = el
                }}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                className="w-10 h-10 sm:w-14 sm:h-14 text-xl font-poppins font-semibold rounded-xl border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 focus:scale-105 transition-all bg-white/80 dark:bg-slate-900/80 text-center focus:outline-none"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Verification Button */}
      <motion.div
        whileHover={isOtpComplete ? { scale: 1.02 } : {}}
        whileTap={isOtpComplete ? { scale: 0.98 } : {}}
      >
        <Button
          onClick={handleVerify}
          disabled={!isOtpComplete || isLoading}
          className="w-full h-12 text-base font-poppins font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            'Verify OTP'
          )}
        </Button>
      </motion.div>

      {/* Countdown Timer */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {!canResend && countdown > 0 ? (
            <>
              Didn&apos;t receive? Resend in{' '}
              <span className="font-poppins font-semibold text-primary">
                {countdown}s
              </span>
            </>
          ) : (
            'Didn&apos;t receive the code?'
          )}
        </p>

        {canResend && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            className="w-full h-10 text-base font-poppins font-semibold text-primary hover:bg-primary/5 rounded-lg"
          >
            Resend OTP
          </Button>
        )}
      </div>

      {/* Success Animation (shown when OTP is complete) */}
      {isOtpComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block p-3 rounded-full bg-primary/10">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-2xl"
            >
              ✓
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

