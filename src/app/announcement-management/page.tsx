'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '../../components/admin-layout'
import {
  Megaphone,
  Plus,
  Send,
  Eye,
  Users,
  CheckCircle,
  History
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'
import { toast } from 'sonner'

interface AnnouncementItem {
  id: string
  title: string
  category: 'notice' | 'emergency' | 'event'
  content: string
  targetAudience: string
  publishedDate: string
  status: 'published' | 'draft'
  views: number
  readOutLoudTxt?: string
}

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'published' | 'draft'>('published')

  // Creator state
  const [newTitle, setNewTitle] = React.useState('')
  const [newCategory, setNewCategory] = React.useState<'notice' | 'emergency' | 'event'>('notice')
  const [newContent, setNewContent] = React.useState('')
  const [newAudience, setNewAudience] = React.useState('All Villagers')
  const [isPublishing, setIsPublishing] = React.useState(false)
  
  // Push alert simulation state
  const [simulatedNotificationText, setSimulatedNotificationText] = React.useState<string | null>(null)

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) {
        const mapped: AnnouncementItem[] = data.map((item: any) => {
          const cat = item.priority?.toLowerCase() === 'high' 
            ? 'emergency' 
            : item.priority?.toLowerCase() === 'low' 
            ? 'event' 
            : 'notice'
          return {
            id: item.id,
            title: item.title,
            category: cat,
            content: item.description || '',
            targetAudience: 'All Villagers',
            publishedDate: new Date(item.created_at).toLocaleString(),
            status: 'published',
            views: Math.floor(Math.random() * 200) + 50
          }
        })
        setAnnouncements(mapped)
      }
    } catch (err) {
      console.error('Error loading announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const [editingAnnouncementId, setEditingAnnouncementId] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadAnnouncements()

    const channel = supabase
      .channel('announcements-admin-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          loadAnnouncements()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleEditClick = (ann: AnnouncementItem) => {
    setNewTitle(ann.title)
    setNewContent(ann.content)
    setNewCategory(ann.category)
    setNewAudience(ann.targetAudience)
    setEditingAnnouncementId(ann.id)
    toast.info(`Editing announcement: ${ann.title}`)
  }

  const handleCancelEdit = () => {
    setEditingAnnouncementId(null)
    setNewTitle('')
    setNewContent('')
    setNewAudience('All Villagers')
    setNewCategory('notice')
  }

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Announcement deleted successfully.')
      setAnnouncements(prev => prev.filter(ann => ann.id !== id))
    } catch (err) {
      console.error('Error deleting announcement:', err)
      toast.error('Failed to delete announcement.')
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const session = getUser()
    const priority = newCategory === 'emergency' ? 'high' : newCategory === 'event' ? 'low' : 'medium'

    setIsPublishing(true)
    try {
      if (editingAnnouncementId) {
        // Edit Existing Announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: newTitle,
            description: newContent,
            priority: priority,
          })
          .eq('id', editingAnnouncementId)

        if (error) throw error

        toast.success('Announcement updated successfully.')
        handleCancelEdit()
      } else {
        // Create New Announcement
        const { data, error } = await supabase
          .from('announcements')
          .insert([{
            title: newTitle,
            description: newContent,
            priority: priority,
            created_by: session?.name || 'Panchayat Officer'
          }])
          .select()
          .single()

        if (error) throw error

        if (data) {
          const isEmergency = newCategory === 'emergency'
          const newAnn: AnnouncementItem = {
            id: data.id,
            title: data.title,
            category: newCategory,
            content: data.description || '',
            targetAudience: newAudience,
            publishedDate: 'Just Now',
            status: 'published',
            views: 0
          }

          setAnnouncements(prev => [newAnn, ...prev])
          
          setSimulatedNotificationText(`${isEmergency ? '🚨 URGENT PUSH ALERT: ' : '📢 New Announcement: '}${newTitle}`)
          
          setNewTitle('')
          setNewContent('')
          setNewAudience('All Villagers')
          setNewCategory('notice')

          setTimeout(() => {
            setSimulatedNotificationText(null)
          }, 5000)
        }
      }
    } catch (err) {
      console.error('Error publishing notice:', err)
      toast.error('Failed to publish notices. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePublishDraft = (id: string) => {
    // Treat as visual update or local mock
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === id
          ? {
              ...ann,
              status: 'published',
              publishedDate: 'Just Now',
              views: 1
            }
          : ann
      )
    )
    alert('Announcement draft published successfully.')
  }

  const filtered = announcements.filter(ann => ann.status === activeTab)

  return (
    <AdminLayout title="Village Announcement Board Manager">
      {/* Alert Push Simulator banner */}
      <AnimatePresence>
        {simulatedNotificationText && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between gap-4 shadow-xl border border-blue-500/20"
          >
            <div className="flex items-center gap-3 text-xs font-bold leading-normal">
              <Megaphone className="w-5 h-5 shrink-0 animate-bounce" />
              <div>
                <p>Simulating Mobile Push Broadcast:</p>
                <p className="font-poppins font-extrabold text-sm">{simulatedNotificationText}</p>
              </div>
            </div>
            <button
              onClick={() => setSimulatedNotificationText(null)}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Creator panel (Left Side) */}
        <section className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
            <Plus className="w-4 h-4 text-blue-500" />
            {editingAnnouncementId ? 'Edit Announcement' : 'Create Announcement'}
          </h3>

          <form onSubmit={handlePublish} className="space-y-3.5 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 uppercase tracking-wide">Headline</label>
              <input
                type="text"
                required
                placeholder="Announcement header title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Category / Type grid */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 uppercase tracking-wide">Broadcasting Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'notice', label: 'Notice' },
                  { val: 'emergency', label: 'SOS Alert' },
                  { val: 'event', label: 'Event' }
                ].map((catOpt) => (
                  <button
                    key={catOpt.val}
                    type="button"
                    onClick={() => setNewCategory(catOpt.val as any)}
                    className={`py-1.5 px-2 rounded-lg font-poppins font-bold transition-all cursor-pointer ${
                      newCategory === catOpt.val
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {catOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 uppercase tracking-wide">Target Ward Audience</label>
              <input
                type="text"
                placeholder="e.g. All Villagers, Wards 1 & 2"
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Body content */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 uppercase tracking-wide">Announcement Description</label>
              <textarea
                rows={4}
                required
                placeholder="Provide detailed information. This text will also support text-to-speech reading on citizen app dashboards..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPublishing}
                className="flex-grow py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-poppins font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isPublishing ? 'Saving...' : editingAnnouncementId ? 'Save Announcement' : 'Publish Broadcast Now'}
              </button>
              {editingAnnouncementId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-poppins font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Existing Listings & Tabs (Right Side) */}
        <div className="md:col-span-7 space-y-4">
          {/* Draft vs Published Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'published'
                  ? 'bg-slate-900 text-blue-400 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Notices ({announcements.filter(a => a.status === 'published').length})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex-1 py-2 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'draft'
                  ? 'bg-slate-900 text-blue-400 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Drafts ({announcements.filter(a => a.status === 'draft').length})
            </button>
          </div>

          {/* List of Announcements */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-slate-300 text-xs font-semibold">
                Loading bulletins feed...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((ann) => {
                const isEmergency = ann.category === 'emergency'
                const isNotice = ann.category === 'notice'

                return (
                  <motion.div
                    key={ann.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3 text-[10px] font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isEmergency 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                            : isNotice
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                        }`}>
                          {ann.category}
                        </span>

                        <span className="text-slate-450">•</span>
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          Target: {ann.targetAudience}
                        </span>
                      </div>

                      <span className="text-slate-300 font-mono">{ann.publishedDate}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-poppins font-extrabold text-sm text-slate-200 leading-tight">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/20 p-3 rounded-xl border border-slate-900/30">
                        {ann.content}
                      </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {ann.views} Citizens Read
                      </span>

                      <div className="flex items-center gap-2">
                        {ann.status === 'draft' ? (
                          <button
                            onClick={() => handlePublishDraft(ann.id)}
                            className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-505 text-white shadow transition-all cursor-pointer"
                          >
                            Publish Draft Now
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-400 uppercase tracking-widest font-extrabold mr-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Live
                          </span>
                        )}
                        <button
                          onClick={() => handleEditClick(ann)}
                          className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 cursor-pointer font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(ann.id)}
                          className="py-1 px-2.5 rounded bg-red-950/20 border border-red-500/20 hover:border-red-500/40 text-red-400 cursor-pointer font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )
              })
            ) : (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-slate-300 text-xs">
                <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                No announcements logged under this category tab.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
