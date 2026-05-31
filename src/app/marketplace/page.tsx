'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Clock,
  MapPin,
  Phone,
  Star,
  Layers,
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronRight,
} from 'lucide-react'

interface Store {
  id: string
  name: string
  category: 'market' | 'pharmacy' | 'temple' | 'ration'
  openHour: number // 24-hr format
  closeHour: number
  phone: string
  location: string
  description: string
  items: string[]
}

const STORES_DATA: Store[] = [
  {
    id: 'store-1',
    name: 'Panchayat Cooperative Supermarket & Ration Shop',
    category: 'ration',
    openHour: 8,
    closeHour: 18,
    phone: '+91 98765 00901',
    location: 'Cooperative Complex, Main Chowk',
    description: 'Subsidized food grains, oil, pulses, and household provisions for card holders.',
    items: ['Rice', 'Wheat Flour', 'Sugar', 'Kerosene', 'Cooking Oil'],
  },
  {
    id: 'store-2',
    name: 'Sri Krishna Weekly Vegetable & Fruit Market',
    category: 'market',
    openHour: 6,
    closeHour: 13,
    phone: '+91 98765 00902',
    location: 'Temple Ground Bazar Wards 1 & 2',
    description: 'Fresh locally harvested organic vegetables, greens, and seasonal fruits direct from farmers.',
    items: ['Spinach', 'Potatoes', 'Onions', 'Mangoes', 'Tomatoes', 'Coconuts'],
  },
  {
    id: 'store-3',
    name: 'Village Sunrise Pharmacy & Medicals',
    category: 'pharmacy',
    openHour: 8,
    closeHour: 22,
    phone: '+91 98765 00903',
    location: 'Opposite Primary Health Center',
    description: 'Life saving medicines, emergency equipment, health supplements, and baby care essentials.',
    items: ['Prescription Medicines', 'First Aid Kits', 'Baby Food', 'Pain Relievers'],
  },
  {
    id: 'store-4',
    name: 'Ganesh Devotional Temple & Prayer Timings',
    category: 'temple',
    openHour: 5,
    closeHour: 20, // (Closed 12-4 in between but we simplify)
    phone: '+91 98765 00904',
    location: 'North Ward Entrance Road',
    description: 'Daily prayer rituals, morning aarti at 6 AM, evening aarti at 7 PM. Prasadam distributed daily.',
    items: ['Morning Aarti: 6:00 AM', 'Evening Aarti: 7:00 PM', 'Special Puja: Friday'],
  },
]

export default function MarketplaceTimings() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [favoriteStoreIds, setFavoriteStoreIds] = React.useState<string[]>([])
  
  // Selected Store Drawer state
  const [selectedStore, setSelectedStore] = React.useState<Store | null>(null)

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavoriteStoreIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Calculate live open status based on current time (using system time)
  const getOpenStatus = (store: Store) => {
    const currentHour = new Date().getHours()
    const isOpen = currentHour >= store.openHour && currentHour < store.closeHour
    return {
      isOpen,
      text: isOpen ? 'Open Now' : 'Closed',
      color: isOpen
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20',
    }
  }

  const filteredStores = STORES_DATA.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || store.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const h = hour % 12 || 12
    return `${h}:00 ${period}`
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/villager-dashboard')}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-sm">Dashboard</span>
        </button>

        <h1 className="font-poppins font-bold text-lg text-amber-500">Market & Shop Timings</h1>

        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
          🛍️
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Search and Filters */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search shops, services, temples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-300">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Starred Stores: {favoriteStoreIds.length}</span>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Services', icon: Layers },
            { id: 'ration', label: 'Cooperative / Ration', icon: ShoppingBag },
            { id: 'market', label: 'Vegetable Market', icon: Sparkles },
            { id: 'pharmacy', label: 'Pharmacies', icon: Heart },
            { id: 'temple', label: 'Temple Timings', icon: Clock },
          ].map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </section>

        {/* Card Grid */}
        <section className="grid gap-4 sm:grid-cols-2">
          {filteredStores.map((store) => {
            const isFav = favoriteStoreIds.includes(store.id)
            const status = getOpenStatus(store)

            return (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className="p-5 rounded-2xl bg-slate-900/45 border border-slate-800 hover:border-amber-500/30 transition-all backdrop-blur-sm shadow-md cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-lg border ${status.color}`}>
                      {status.text}
                    </span>

                    <button
                      onClick={(e) => handleToggleFavorite(store.id, e)}
                      className="p-1.5 rounded-lg border bg-slate-950 border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-poppins font-bold text-slate-200 group-hover:text-amber-400 transition-colors leading-snug">
                    {store.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {formatTime(store.openHour)} - {formatTime(store.closeHour)}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold group-hover:translate-x-0.5 transition-transform">
                    Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )
          })}
        </section>
      </main>

      {/* Store Detail Popup Drawer */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Shop Information
                </span>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-poppins font-extrabold text-base sm:text-lg text-slate-200">
                    {selectedStore.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getOpenStatus(selectedStore).color}`}>
                      {getOpenStatus(selectedStore).text}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Hrs: {formatTime(selectedStore.openHour)} - {formatTime(selectedStore.closeHour)}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {selectedStore.description}
                </p>

                {/* Location Map Mockup */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850/50 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-300">Location Address</p>
                      <p className="text-slate-400">{selectedStore.location}</p>
                    </div>
                  </div>
                </div>

                {/* Key items list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Featured Items / Services
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStore.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      alert(`Mock call initiated to: ${selectedStore.phone}`)
                    }}
                    className="flex-grow py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-poppins font-bold text-sm cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    Call Service
                  </button>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-poppins font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
