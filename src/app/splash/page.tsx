import * as React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedMicrophoneOrb } from '../../components/animated-microphone-orb'

export default function SplashScreen() {
  const navigate = useNavigate()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landing')
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])
  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
      },
    }),
  }

  return (
    <div className="min-h-screen gradient-emerald-to-blue flex items-center justify-center px-4">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center space-y-12 max-w-md"
      >
        {/* Logo and animated orb */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
        >
          <AnimatedMicrophoneOrb />
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <motion.h1
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            GramVoice
          </motion.h1>
          <motion.p
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Empowering rural communities through voice technology
          </motion.p>
        </div>

        {/* Loading animation */}
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-secondary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>

        {/* Skip button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="pt-4"
        >
          <Link
            to="/landing"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Skip →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
