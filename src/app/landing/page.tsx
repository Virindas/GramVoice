'use client'

import { motion } from 'framer-motion'
import { AnimatedMicrophoneOrb } from '../../components/animated-microphone-orb'
import { RoleSelector } from '../../components/role-selector'
import { ChevronDown } from 'lucide-react'

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <div className="min-h-screen gradient-emerald-to-blue flex flex-col items-center justify-center px-4 py-12">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-4xl space-y-12"
      >
        {/* Header with logo */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <AnimatedMicrophoneOrb />
          </div>
          <h1 className="text-5xl md:text-6xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to GramVoice
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Bridging the digital divide through AI-powered voice technology. Your voice, your choice, your community.
          </p>
        </motion.div>

        {/* Floating features */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎤',
              title: 'Voice First',
              description: 'Speak your language, naturally',
            },
            {
              icon: '🤝',
              title: 'Community',
              description: 'Connect with your village',
            },
            {
              icon: '🔒',
              title: 'Secure',
              description: 'Your privacy matters',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border-2 border-primary/20 backdrop-blur-sm text-center"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-poppins font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Role Selection */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-poppins font-semibold text-foreground mb-2">
              Who are you?
            </h2>
            <p className="text-muted-foreground">
              Choose your role to get started
            </p>
          </div>
          <div className="flex justify-center">
            <RoleSelector />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center pt-8"
        >
          <ChevronDown className="w-6 h-6 text-primary/50" />
        </motion.div>
      </motion.div>
    </div>
  )
}
