'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Shield,
  UploadCloud,
  FileText,
  Eye,
  Download,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react'

interface DocumentItem {
  id: string
  name: string
  type: 'identity' | 'utility' | 'certificate'
  issuer: string
  docNumber: string
  status: 'verified' | 'pending' | 'expired'
  issueDate: string
  fileSize?: string
  description: string
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Aadhaar Card',
    type: 'identity',
    issuer: 'UIDAI',
    docNumber: 'XXXX XXXX 8921',
    status: 'verified',
    issueDate: '2021-04-12',
    fileSize: '1.2 MB',
    description: 'National identity document containing biometric and demographic data.'
  },
  {
    id: 'doc-2',
    name: 'Ration Card',
    type: 'identity',
    issuer: 'Food & Civil Supplies Dept',
    docNumber: 'RC-99812-NC',
    status: 'verified',
    issueDate: '2019-08-25',
    fileSize: '840 KB',
    description: 'Official document issued by state governments to purchase subsidized food grain.'
  },
  {
    id: 'doc-3',
    name: 'Agriculture Land Record (Patta/Chitta)',
    type: 'certificate',
    issuer: 'Revenue Department',
    docNumber: 'P-128/99A',
    status: 'verified',
    issueDate: '2024-01-15',
    fileSize: '2.4 MB',
    description: 'Land registration record showing ownership details and survey number 128.'
  },
  {
    id: 'doc-4',
    name: 'Electricity Utility Bill (KSEB/State Grid)',
    type: 'utility',
    issuer: 'State Electricity Board',
    docNumber: 'EB-2026-921',
    status: 'verified',
    issueDate: '2026-05-10',
    fileSize: '410 KB',
    description: 'Monthly utility consumption statement for residential connection.'
  },
  {
    id: 'doc-5',
    name: 'Crop Insurance Certificate',
    type: 'certificate',
    issuer: 'PM Fasal Bima Yojana',
    docNumber: 'PMFBY-88390',
    status: 'pending',
    issueDate: '2026-05-02',
    fileSize: '1.8 MB',
    description: 'Coverage certificate for weather-based crop insurance scheme.'
  }
]

export default function DigitalDocuments() {
  const navigate = useNavigate()
  const [documents, setDocuments] = React.useState<DocumentItem[]>(INITIAL_DOCUMENTS)
  const [activeTab, setActiveTab] = React.useState<'all' | 'identity' | 'utility' | 'certificate'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [speakingDocId, setSpeakingDocId] = React.useState<string | null>(null)
  
  // Upload Simulation States
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)
  const [selectedFileType, setSelectedFileType] = React.useState<'identity' | 'utility' | 'certificate'>('identity')
  const [uploadedFileName, setUploadedFileName] = React.useState('')

  const handleSpeakDocument = (doc: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (speakingDocId === doc.id) {
      window.speechSynthesis.cancel()
      setSpeakingDocId(null)
      return
    }

    window.speechSynthesis.cancel()
    const text = `Document: ${doc.name}. Issued by: ${doc.issuer}. Status: ${doc.status}. Details: ${doc.description}`
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.onend = () => {
      setSpeakingDocId(null)
    }
    utterance.onerror = () => {
      setSpeakingDocId(null)
    }

    setSpeakingDocId(doc.id)
    window.speechSynthesis.speak(utterance)
  }

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this document from your local vault?')) {
      setDocuments(prev => prev.filter(d => d.id !== id))
    }
  }

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)

    // Simulate progress updates
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadSuccess(true)
          
          // Add new document to list
          const newDoc: DocumentItem = {
            id: `doc-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
            type: selectedFileType,
            issuer: 'Self Uploaded',
            docNumber: `MOCK-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'verified',
            issueDate: new Date().toISOString().split('T')[0],
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            description: 'Custom document uploaded securely by the citizen.'
          }
          setDocuments(prevDocs => [newDoc, ...prevDocs])
          
          // Clear notification banner after 3 seconds
          setTimeout(() => {
            setUploadSuccess(false)
          }, 3000)
          
          return 100
        }
        return prev + 20
      })
    }, 150)
  }

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const filteredDocs = documents.filter(doc => {
    const matchesTab = activeTab === 'all' || doc.type === activeTab
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-90 h-90 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
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

        <h1 className="font-poppins font-bold text-lg text-cyan-400 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-500" />
          <span>DigiLocker Secure Vault</span>
        </h1>

        <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-sm">
          📁
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 space-y-6 relative z-10">
        
        {/* Secure Banner */}
        <section className="p-5 rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest leading-none">Government Verified Vault</p>
            <h2 className="text-xl sm:text-2xl font-poppins font-extrabold tracking-tight text-slate-200">
              Your Digital Documents Locker
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              Securely store and verify Aadhaar, Ration Card, Land records, and agricultural certificates with digital signatures.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 animate-pulse" />
            256-bit Encrypted
          </div>
        </section>

        {/* Upload and Filter Container */}
        <section className="grid gap-6 md:grid-cols-12">
          {/* File Upload Panel */}
          <div className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
              <UploadCloud className="w-4 h-4 text-cyan-500" />
              Upload New Document
            </h3>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400">Document Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'identity', label: 'Identity' },
                  { val: 'utility', label: 'Utility' },
                  { val: 'certificate', label: 'Certify' }
                ].map((typeOption) => (
                  <button
                    key={typeOption.val}
                    type="button"
                    onClick={() => setSelectedFileType(typeOption.val as any)}
                    className={`py-1.5 px-2 rounded-lg font-poppins text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedFileType === typeOption.val
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {typeOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Drag & Drop / Upload area */}
            <div className="relative border-2 border-dashed border-slate-850 hover:border-cyan-500/40 rounded-2xl bg-slate-950/60 p-6 flex flex-col items-center justify-center text-center transition-all group overflow-hidden">
              <input
                type="file"
                id="file-upload-input"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleFileUploadSimulate}
                disabled={isUploading}
              />
              
              <UploadCloud className="w-10 h-10 text-slate-600 group-hover:text-cyan-500 transition-colors mb-2" />
              <p className="text-xs font-bold text-slate-300">Tap to browse or take photo</p>
              <p className="text-[10px] text-slate-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
            </div>

            {/* Progress indicators / Success message */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="truncate max-w-[150px]">Uploading: {uploadedFileName}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-150" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Document securely encrypted & uploaded!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Documents Feed Panel */}
          <div className="md:col-span-7 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search stored documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-850 focus:border-cyan-500 focus:outline-none w-full text-slate-100"
                />
              </div>

              {/* Filtering tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900">
                {[
                  { val: 'all', label: 'All Docs' },
                  { val: 'identity', label: 'Identity' },
                  { val: 'utility', label: 'Utilities' },
                  { val: 'certificate', label: 'Certificates' }
                ].map((tab) => (
                  <button
                    key={tab.val}
                    onClick={() => setActiveTab(tab.val as any)}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-poppins text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
                      activeTab === tab.val
                        ? 'bg-slate-900 text-cyan-400 shadow-inner'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Documents */}
            <div className="space-y-3.5">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  const isSpeaking = speakingDocId === doc.id
                  const isVerified = doc.status === 'verified'
                  const isPending = doc.status === 'pending'

                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between gap-4 relative group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-xl shrink-0">
                            {doc.type === 'identity' ? '🪪' : doc.type === 'utility' ? '⚡' : '📜'}
                          </div>
                          <div>
                            <h4 className="font-poppins font-bold text-sm text-slate-200">
                              {doc.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {doc.issuer} • {doc.docNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleSpeakDocument(doc, e)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isSpeaking
                                ? 'bg-red-500/10 border-red-500 text-red-400'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                            }`}
                            title="Listen details"
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          
                          <button
                            onClick={(e) => handleDeleteDocument(doc.id, e)}
                            className="p-1.5 rounded-lg border border-slate-850 bg-slate-950 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Description / metadata */}
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-900/40">
                        {doc.description}
                      </p>

                      {/* Actions & status bar */}
                      <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-[10px]">
                        <span className="flex items-center gap-1 font-semibold text-slate-400">
                          {doc.fileSize && (
                            <>
                              <FileText className="w-3 h-3 text-cyan-500" />
                              {doc.fileSize}
                            </>
                          )}
                          <span className="text-slate-600">• Issued: {doc.issueDate}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                            isVerified 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : isPending
                              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {doc.status}
                          </span>

                          <button 
                            onClick={() => alert(`Showing digital card preview for: ${doc.name}`)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-750"
                            title="View Document"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          
                          <button 
                            onClick={() => alert(`Downloading verified PDF copy of ${doc.name}`)}
                            className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg cursor-pointer transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm text-center text-slate-500 text-xs">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No documents found matching filters or search queries.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
