"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Wrench, 
  Bell, 
  Shield, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react"

const ANNOUNCEMENT_TYPES = {
  info: { icon: Info, color: "#3B82F6", label: "Information" },
  success: { icon: CheckCircle, color: "#10B981", label: "Success" },
  warning: { icon: AlertTriangle, color: "#F59E0B", label: "Warning" },
  error: { icon: AlertCircle, color: "#EF4444", label: "Error" },
  maintenance: { icon: Wrench, color: "#8B5CF6", label: "Maintenance" },
  update: { icon: Bell, color: "#06B6D4", label: "Update" },
  security: { icon: Shield, color: "#DC2626", label: "Security" },
  feature: { icon: Sparkles, color: "#F97316", label: "New Feature" },
  loading: { icon: Clock, color: "#6B7280", label: "Loading" },
}

interface Announcement {
  id: string
  title: string
  message: string
  type: keyof typeof ANNOUNCEMENT_TYPES
  timestamp: number
  image?: string
  link?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface AnnouncementPanelProps {
  onClose?: () => void
}

export function AnnouncementPanel({ onClose }: AnnouncementPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set())

  // GitHub'dan duyuruları çek
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/sleepsweetly/AuraFX-Launcher-Apps/refs/heads/main/announcements.json")
        const data = await response.json()
        
        if (data.announcements && Array.isArray(data.announcements)) {
          const newAnnouncements = data.announcements.map((announcement: any) => ({
            id: `announcement-${Date.now()}-${Math.random()}`,
            title: announcement.title,
            message: announcement.message,
            type: announcement.type || 'info',
            timestamp: Date.now(),
            image: announcement.image,
            link: announcement.link,
            priority: announcement.priority || 'medium'
          }))
          
          setAnnouncements(newAnnouncements)
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const toggleExpanded = (id: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredAnnouncements = announcements


  if (loading) {
    return (
      <div className="h-full w-full bg-white flex flex-col text-sm">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Announcements</h3>
              <p className="text-sm text-gray-500">Loading announcements...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Clock className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-white flex flex-col text-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Announcements</h3>
              <p className="text-sm text-gray-500">{filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>


      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No announcements found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              const typeConfig = ANNOUNCEMENT_TYPES[announcement.type]
              const Icon = typeConfig.icon
              const isExpanded = expandedAnnouncements.has(announcement.id)
              
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: typeConfig.color + '15', color: typeConfig.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 leading-tight">
                          {announcement.title}
                        </h3>
                        <span className="text-xs text-gray-500 font-mono ml-2 flex-shrink-0">
                          {new Date(announcement.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {isExpanded ? announcement.message : announcement.message.substring(0, 150) + '...'}
                      </div>
                      
                      {announcement.message.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(announcement.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-3 font-medium"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Read More
                            </>
                          )}
                        </button>
                      )}
                      
                      {announcement.link && (
                        <a
                          href={announcement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
