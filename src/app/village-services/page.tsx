'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Phone,
  PhoneCall,
  Star,
  Layers,
  Wrench,
  Truck,
  Heart,
  ShoppingBag,
  Sparkles,
  MapPin,
} from 'lucide-react'

interface ServiceVendor {
  id: string
  name: string
  serviceName: string
  category: 'home' | 'transport' | 'agri' | 'essential'
  phone: string
  rating: number
  distance: string
  available: boolean
  timings: string
  icon: any
}

const VENDORS_DATA: ServiceVendor[] = [
  {
    id: 'v-1',
    name: 'Hari Shankar',
    serviceName: 'Village Electrician & Wire Repair',
    category: 'home',
    phone: '+91 98765 00101',
    rating: 4.8,
    distance: '0.8 km away',
    available: true,
    timings: '08:00 AM - 08:00 PM',
    icon: Wrench,
  },
  {
    id: 'v-2',
    name: 'Rajesh Plumber',
    serviceName: 'Water Pump & Borewell Repair',
    category: 'home',
    phone: '+91 98765 00102',
    rating: 4.6,
    distance: '1.5 km away',
    available: false,
    timings: '09:00 AM - 07:00 PM',
    icon: Wrench,
  },
  {
    id: 'v-3',
    name: 'M. Selvam Auto Drivers',
    serviceName: 'Panchayat Ward Auto & Taxi Service',
    category: 'transport',
    phone: '+91 98765 00103',
    rating: 4.9,
    distance: '0.4 km away',
    available: true,
    timings: '24 Hours Emergency Service',
    icon: Truck,
  },
  {
    id: 'v-4',
    name: 'North Farmer Seeds & Fertilizer Co.',
    serviceName: 'Seed Suppliers & Organic Soil',
    category: 'agri',
    phone: '+91 98765 00104',
    rating: 4.5,
    distance: '2.3 km away',
    available: true,
    timings: '08:00 AM - 06:00 PM',
    icon: Sparkles,
  },
  {
    id: 'v-5',
    name: 'Cooperative Medical Store',
    serviceName: 'Panchayat Pharmacy & Essentials',
    category: 'essential',
    phone: '+91 98765 00105',
    rating: 4.7,
    distance: '1.1 km away',
    available: true,
    timings: '08:00 AM - 09:30 PM',
    icon: Heart,
  },
  {
    id: 'v-6',
    name: 'Sri Krishna Dairy & Milk Delivery',
    serviceName: 'Daily Milk Suppliers & Ghee',
    category: 'essential',
    phone: '+91 98765 00106',
    rating: 4.8,
    distance: '0.7 km away',
    available: true,
    timings: '05:00 AM - 11:30 AM',
    icon: ShoppingBag,
  },
]

export default function VillageServices() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [favoritedVendorIds, setFavoritedVendorIds] = React.useState<string[]>([])
  
  // Calling dialog details
  const [activeDial, setActiveDial] = React.useState<ServiceVendor | null>(null)

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavoritedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const filteredVendors = VENDORS_DATA.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || v.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-90 h-90 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-85 h-85 bg-yellow-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-amber-500">Village Services Directory</h1>

        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
          🛠️
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Search */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search electrician, plumber, auto driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-300">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Starred Vendors: {favoritedVendorIds.length}</span>
          </div>
        </section>

        {/* Category selector */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Services', icon: Layers },
            { id: 'home', label: 'Home Repair', icon: Wrench },
            { id: 'transport', label: 'Transport', icon: Truck },
            { id: 'agri', label: 'Agriculture', icon: Sparkles },
            { id: 'essential', label: 'Essentials', icon: ShoppingBag },
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

        {/* Vendor Grid */}
        <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
            const isFav = favoritedVendorIds.includes(vendor.id)

            return (
              <div
                key={vendor.id}
                className="p-5 rounded-2xl border border-slate-850 bg-slate-900/45 hover:border-amber-500/35 transition-all flex flex-col justify-between gap-4 backdrop-blur-sm shadow-md group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                      vendor.available
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {vendor.available ? 'Available' : 'Busy'}
                    </span>

                    <button
                      onClick={(e) => handleToggleFavorite(vendor.id, e)}
                      className="p-1.5 rounded-lg border bg-slate-950 border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-poppins font-extrabold text-sm sm:text-base text-slate-200">
                      {vendor.name}
                    </h4>
                    <p className="text-xs text-amber-500 font-semibold">{vendor.serviceName}</p>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {vendor.rating} Ratings
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {vendor.distance}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDial(vendor)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-poppins font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-750 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Call Vendor: {vendor.phone}
                </button>
              </div>
            )
          })}
        </section>
      </main>

      {/* Simulated Active Call overlay */}
      <AnimatePresence>
        {activeDial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-md w-full">
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 mx-auto flex items-center justify-center shadow-2xl">
                  <PhoneCall className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-poppins font-extrabold text-white">
                    Calling Service Provider...
                  </h2>
                  <p className="text-sm text-amber-500 font-semibold">{activeDial.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">Dialing: {activeDial.phone}</p>
                </div>
              </div>

              {/* Simulated ringing dots */}
              <div className="flex gap-2 justify-center py-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-amber-500"
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
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex gap-3 text-left">
                <Layers className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="font-bold text-slate-200">Hyperlocal Service Gateway:</p>
                  <p>Calling the service provider directly. Timings are managed by Panchayat volunteers.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDial(null)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-poppins font-bold shadow-lg cursor-pointer"
              >
                End Dial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
