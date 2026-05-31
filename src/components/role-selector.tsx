'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function RoleSelector() {
  const roles = [
    {
      id: 'villager',
      title: 'Villager',
      description: 'Access community services and voice records',
      icon: '👤',
    },
    {
      id: 'admin',
      title: 'Panchayat Admin',
      description: 'Manage village records and services',
      icon: '👨‍💼',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 w-full max-w-2xl">
      {roles.map((role, idx) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to={`/login?role=${role.id}`}>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer backdrop-blur-sm">
              <div className="text-5xl mb-4">{role.icon}</div>
              <h3 className="text-xl font-poppins font-semibold text-foreground mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
