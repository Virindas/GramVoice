'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface LanguageCardProps {
  code: string
  name: string
  flag: string
  nativeName: string
}

export function LanguageCard({ code, name, flag, nativeName }: LanguageCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="h-full"
    >
      <Link to={`/login?lang=${code}`}>
        <div className="h-full p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer backdrop-blur-sm flex flex-col items-center justify-center gap-4 min-h-[180px]">
          <div className="text-6xl">{flag}</div>
          <div className="text-center">
            <h3 className="text-lg font-poppins font-semibold text-foreground">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{nativeName}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function LanguageSelector() {
  const languages: LanguageCardProps[] = [
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
    { code: 'en', name: 'English', flag: '🌍', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
      {languages.map((lang, idx) => (
        <motion.div
          key={lang.code}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <LanguageCard {...lang} />
        </motion.div>
      ))}
    </div>
  )
}
