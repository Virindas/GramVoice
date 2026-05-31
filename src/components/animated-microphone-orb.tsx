'use client'

import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

export function AnimatedMicrophoneOrb() {
  return (
    <motion.div
      className="relative w-32 h-32 mx-auto"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, type: 'spring' }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary blur-2xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner orb */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Mic className="w-12 h-12 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.div>
  )
}
