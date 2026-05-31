'use client'

import { motion } from 'framer-motion'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { OTPVerificationForm } from '../../components/otp-verification-form'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function OTPVerificationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const phone = searchParams.get('phone') || '+91 XXXXXXXXXX'
  const role = searchParams.get('role') || 'villager'
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Auto trigger success checkmark screen after 800ms
    const successTimer = setTimeout(() => {
      setIsVerified(true)
    }, 800)
    return () => clearTimeout(successTimer)
  }, [])

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        navigate(role === 'admin' ? '/admin-dashboard' : '/villager-dashboard')
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [isVerified, role, navigate])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  if (isVerified) {
    return (
      <div className="min-h-screen gradient-emerald-to-blue flex flex-col items-center justify-center px-4">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="relative z-10 text-center space-y-8"
        >
          {/* Success checkmark */}
          <motion.div
            className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2 }}
              className="text-5xl"
            >
              ✓
            </motion.div>
          </motion.div>

          {/* Success message */}
          <div className="space-y-2">
            <h1 className="text-4xl font-poppins font-bold text-foreground">
              Verification Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your number has been verified
            </p>
          </div>

          {/* Loading dots */}
          <motion.div className="flex gap-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground text-sm"
          >
            Redirecting you to your dashboard...
          </motion.p>

          {/* Manual redirect option */}
          <Link
            to={role === 'admin' ? '/admin-dashboard' : '/villager-dashboard'}
            className="inline-block mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold hover:shadow-lg transition-all"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-emerald-to-blue flex flex-col items-center justify-center px-4 py-12">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
          }}
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
          to="/login"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Top spacer for better centering */}
        <div className="h-16" />

        {/* Form container */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-center"
          >
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="text-3xl"
              >
                🔐
              </motion.div>
            </div>
          </motion.div>

          {/* OTP Verification Form */}
          <OTPVerificationForm
            phone={phone}
            onVerify={(otp) => {
              console.log('OTP verified:', otp)
              setTimeout(() => setIsVerified(true), 500)
            }}
            onResend={() => {
              console.log('Resend OTP')
            }}
          />
        </div>

        {/* Security info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-xs text-muted-foreground space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🔒</span>
            <p>Your data is encrypted and secure</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
