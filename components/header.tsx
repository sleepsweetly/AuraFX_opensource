"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Hexagon, FileText, FolderOpen, Plus, Grid3X3, Box, BookOpen, Mail, HelpCircle, Shield, FileText as Terms, Info } from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useState, useRef, useEffect } from "react"

interface HeaderProps {
  onGenerateCode?: () => void
  onSave?: () => void
  onLoad?: () => void
  onNewProject?: () => void
  minimizedPanels?: string[]
  onRestorePanel?: (panelId: string) => void
  showGridCoordinates?: boolean
  onToggleGridCoordinates?: () => void
  onShowChangelog?: () => void
  onShowTutorial?: () => void
}

export function Header(props: HeaderProps = {}) {
  const { onNewProject, onSave, onLoad, onShowTutorial } = props
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [show3DBadge, setShow3DBadge] = useState(true)

  // Rickroll easter egg
  const [showRickroll, setShowRickroll] = useState(false)
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Her açılışta badge göster (localStorage kaldırıldı)
  const handle3DClick = () => {
    // Badge'i geçici olarak kaldır (sayfa yenilenince tekrar gelir)
    setShow3DBadge(false)

    // 3D Modal'ı aç
    const event = new CustomEvent('open3DModal')
    window.dispatchEvent(event)
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.1,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  }

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -5, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.1,
        ease: "easeOut",
        staggerChildren: 0.02,
        when: "beforeChildren"
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: { duration: 0.08, ease: "easeIn" }
    }
  }

  const dropdownItemVariants: Variants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.08,
        ease: "easeOut"
      }
    }
  }

  // Rickroll easter egg - 5 clicks within 2 seconds
  const handleLogoClick = () => {
    clickCountRef.current += 1

    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // If 5 clicks within 2 seconds, rickroll!
    if (clickCountRef.current >= 5) {
      setShowRickroll(true)
      clickCountRef.current = 0
      return
    }

    // Reset click count after 2 seconds
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, 2000)
  }

  return (
    <motion.div
      className="fixed top-4 left-4 z-40" // Header'ı en sola taşıdık
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-gray-200/50"
        whileHover={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          transition: { duration: 0.2 }
        }}
      >
        {/* Logo & Brand */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogoClick}
        >
          <motion.div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Hexagon className="h-4 w-4 text-white fill-white" />
          </motion.div>
          <span className="text-sm font-semibold text-gray-900">AuraFX</span>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-px h-4 bg-gray-300 mx-1"
          variants={itemVariants}
        />

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewProject}
            className="h-8 gap-1 hover:bg-gray-100 text-gray-700 relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("new")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className="absolute inset-0 bg-gray-100 z-0"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "new" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <Plus className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "new" ? 'text-black' : 'text-gray-700'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "new" ? 'text-black' : 'text-gray-700'}`}>New</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8 gap-1 hover:bg-gray-100 text-gray-700 relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("save")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className="absolute inset-0 bg-gray-100 z-0"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "save" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <FileText className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "save" ? 'text-black' : 'text-gray-700'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "save" ? 'text-black' : 'text-gray-700'}`}>Save</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoad}
            className="h-8 gap-1 hover:bg-gray-100 text-gray-700 relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("open")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className="absolute inset-0 bg-gray-100 z-0"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "open" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <FolderOpen className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "open" ? 'text-black' : 'text-gray-700'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "open" ? 'text-black' : 'text-gray-700'}`}>Open</span>
          </Button>
        </motion.div>

        {/* Pages Menu */}
        <motion.div variants={itemVariants}>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 hover:bg-gray-100 text-gray-700 relative group"
                onMouseEnter={() => setHoveredItem("pages")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  className="absolute inset-0 bg-gray-100 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: hoveredItem === "pages" ? "100%" : "0%" }}
                  transition={{ duration: 0.2 }}
                />
                <Grid3X3 className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "pages" ? 'text-black' : 'text-gray-700'}`} />
                <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "pages" ? 'text-black' : 'text-gray-700'}`}>Pages</span>
                {show3DBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse z-50">
                    <span className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                  </span>
                )}
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "pages" ? 'text-black' : 'text-gray-700'}`} />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {isDropdownOpen && (
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl"
                  sideOffset={8}
                  asChild
                  forceMount
                >
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Editors
                    </div>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={handle3DClick}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full relative"
                      >
                        <Box className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            3D Editor
                            {show3DBadge && (
                              <span className="inline-flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse relative">
                                <span className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Advanced 3D particle effects</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>

                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100 mt-1">
                      Resources
                    </div>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={() => window.location.href = '/wiki'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Wiki</div>
                          <div className="text-xs text-gray-500">Documentation & guides</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>

        {/* More Menu */}
        <motion.div variants={itemVariants}>
          <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 hover:bg-gray-100 text-gray-700 relative overflow-hidden group"
                onMouseEnter={() => setHoveredItem("more")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  className="absolute inset-0 bg-gray-100 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: hoveredItem === "more" ? "100%" : "0%" }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  animate={{ rotate: isMoreMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "more" ? 'text-black' : 'text-gray-700'}`} />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {isMoreMenuOpen && (
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl"
                  sideOffset={8}
                  asChild
                  forceMount
                >
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Help & Legal
                    </div>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={() => window.location.href = '/about'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                        About
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={() => window.location.href = '/contact'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <Mail className="w-4 h-4 text-green-600" />
                        Contact
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={() => window.location.href = '/faq'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <HelpCircle className="w-4 h-4 text-yellow-600" />
                        FAQ
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={onShowTutorial}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <HelpCircle className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium">Tutorial</div>
                          <div className="text-xs text-gray-500">Show tutorial again</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={() => window.location.href = '/privacy-policy'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <Shield className="w-4 h-4 text-red-600" />
                        Privacy Policy
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 cursor-pointer flex items-center gap-2 p-2"
                      onClick={() => window.location.href = '/terms-of-service'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <Terms className="w-4 h-4 text-gray-700" />
                        Terms of Service
                      </motion.div>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>
      </motion.div>

      {/* Rickroll Modal */}
      <AnimatePresence>
        {showRickroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRickroll(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRickroll(false)}
                className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors z-10"
              >
                ×
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}