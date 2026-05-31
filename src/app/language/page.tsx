'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '../../components/language-selector'
import { ArrowLeft } from 'lucide-react'

export default function LanguageSelectionPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
          className="absolute top-20 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
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
        className="relative z-10 w-full max-w-5xl space-y-12 text-center"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-poppins font-bold text-foreground">
            Choose Your Language
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Select your preferred language to continue. You can change this anytime.
          </p>
        </motion.div>

        {/* Language selector */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <LanguageSelector />
        </motion.div>

        {/* Info cards */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-4 text-center mt-12"
        >
          {[
            { icon: '🔊', text: 'Voice-first experience' },
            { icon: '♿', text: 'Fully accessible' },
            { icon: '🌍', text: 'Multi-language support' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-medium text-foreground">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
