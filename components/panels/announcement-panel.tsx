"use client"

import { useState, useEffect } from "react"
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
  info: { icon: Info, label: "Information" },
  success: { icon: CheckCircle, label: "Success" },
  warning: { icon: AlertTriangle, label: "Warning" },
  error: { icon: AlertCircle, label: "Error" },
  maintenance: { icon: Wrench, label: "Maintenance" },
  update: { icon: Bell, label: "Update" },
  security: { icon: Shield, label: "Security" },
  feature: { icon: Sparkles, label: "New Feature" },
  loading: { icon: Clock, label: "Loading" },
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

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0 mt-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
              <Bell className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-foreground">Announcements</h3>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Loading data</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
            <Bell className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">Announcements</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {announcements.length} Notification{announcements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted text-muted-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {announcements.length === 0 ? (
          <div className="h-40 flex items-center justify-center border border-dashed border-border/50 rounded-xl bg-muted/5">
            <div className="text-center space-y-1">
              <Bell className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">No announcements</p>
            </div>
          </div>
        ) : (
          announcements.map((announcement) => {
            const typeConfig = ANNOUNCEMENT_TYPES[announcement.type]
            const Icon = typeConfig.icon
            const isExpanded = expandedAnnouncements.has(announcement.id)

            return (
              <div key={announcement.id} className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpanded(announcement.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col items-start gap-1 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground leading-tight">
                        {announcement.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(announcement.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="overflow-hidden bg-muted/10 border-t border-border/50">
                    <div className="p-3 text-[10px] text-foreground font-medium leading-relaxed">
                      {announcement.message}

                      {announcement.link && (
                        <a
                          href={announcement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-1.5 w-fit border border-foreground/30 px-2 py-1 rounded hover:bg-foreground hover:text-background transition-colors text-foreground uppercase tracking-widest font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
      `}</style>
    </div>
  )
}

function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
