"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Hexagon, FileText, FolderOpen, Plus, Grid3X3, Box, BookOpen, Mail, HelpCircle, Shield, FileText as Terms, Info, Sun, Moon, Github, Heart } from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { siteConfig, getDiscordInviteUrl } from "@/lib/config"
// Twitter Bird Icon Component
const TwitterBird = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
)

// Discord Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

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
}

export function Header(props: HeaderProps = {}) {
  const { onNewProject, onSave, onLoad } = props
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [discordUrl, setDiscordUrl] = useState<string>(siteConfig.discordInviteUrl)
  
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Merkezi config'den Discord linkini al
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url)
    }).catch(() => {
      setDiscordUrl(siteConfig.discordInviteUrl)
    })
  }, [])
  


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


  return (
    <motion.div
      className="fixed top-4 left-4 z-40" // Header'ı en sola taşıdık
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center gap-2 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-gray-200/50 dark:border-zinc-800/50"
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
        >
          <motion.div 
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black dark:bg-white"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Hexagon className="h-4 w-4 text-white dark:text-black fill-white dark:fill-black" />
          </motion.div>
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">AuraFX</span>
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="w-px h-4 bg-gray-300 dark:bg-zinc-800 mx-1"
          variants={itemVariants}
        />

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewProject}
            className="h-8 gap-1 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300 relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("new")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.span 
              className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "new" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <Plus className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "new" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "new" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>New</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8 gap-1 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300 relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("save")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.span 
              className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "save" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <FileText className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "save" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "save" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>Save</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoad}
            className="h-8 gap-1 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300 relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("open")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.span 
              className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "open" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <FolderOpen className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "open" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "open" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>Open</span>
          </Button>
        </motion.div>

        {/* Pages Menu */}
        <motion.div variants={itemVariants}>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300 relative overflow-hidden group"
                onMouseEnter={() => setHoveredItem("pages")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.span 
                  className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
                  initial={{ width: "0%" }}
                  animate={{ width: hoveredItem === "pages" ? "100%" : "0%" }}
                  transition={{ duration: 0.2 }}
                />
                <Grid3X3 className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "pages" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`} />
                <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "pages" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>Pages</span>
                <motion.span
                  className="inline-block relative z-10"
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`h-3 w-3 transition-colors duration-200 ${hoveredItem === "pages" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`} />
                </motion.span>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {isDropdownOpen && (
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 shadow-xl" 
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
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => {
                        const event = new CustomEvent('open3DModal')
                        window.dispatchEvent(event)
                      }}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <Box className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-zinc-100">3D Editor</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">Advanced 3D particle effects</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>

                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100 mt-1">
                      Resources
                    </div>
                     <DropdownMenuItem
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => window.location.href = '/wiki'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-zinc-100">Wiki</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">Documentation & guides</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>

        {/* Theme Switcher */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300 relative overflow-hidden"
            title={!mounted ? "Switch Theme" : (theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode")}
          >
            {!mounted ? (
              <div className="h-4.5 w-4.5" />
            ) : theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500/20" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 fill-blue-500/10" />
            )}
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="w-px h-4 bg-gray-300 dark:bg-zinc-800 mx-1"
          variants={itemVariants}
        />

        {/* Social Icons */}
        <motion.div className="flex items-center gap-0.5" variants={itemVariants}>
          <motion.a
            href="https://github.com/sleepsweetly"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 rounded-full flex items-center justify-center relative overflow-hidden text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100"
            title="GitHub"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredIcon("github")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <motion.span 
              className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
              initial={{ width: "0%" }}
              animate={{ width: hoveredIcon === "github" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <Github className="w-4 h-4 relative z-10" />
          </motion.a>

          <motion.a
            href="https://x.com/sleepsweety_"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 rounded-full flex items-center justify-center relative overflow-hidden text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100"
            title="Twitter"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredIcon("twitter")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <motion.span 
              className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
              initial={{ width: "0%" }}
              animate={{ width: hoveredIcon === "twitter" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <TwitterBird className="w-4 h-4 relative z-10" />
          </motion.a>

          <motion.a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 rounded-full flex items-center justify-center relative overflow-hidden text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100"
            title="Discord"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredIcon("discord")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <motion.span 
              className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
              initial={{ width: "0%" }}
              animate={{ width: hoveredIcon === "discord" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <DiscordIcon className="w-4.5 h-4.5 relative z-10" />
          </motion.a>
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="w-px h-4 bg-gray-300 dark:bg-zinc-800 mx-1"
          variants={itemVariants}
        />

        {/* More Menu */}
        <motion.div variants={itemVariants}>
          <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300 relative overflow-hidden group"
                onMouseEnter={() => setHoveredItem("more")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.span 
                  className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 z-0 block"
                  initial={{ width: "0%" }}
                  animate={{ width: hoveredItem === "more" ? "100%" : "0%" }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="inline-block relative z-10"
                  animate={{ rotate: isMoreMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`h-3 w-3 transition-colors duration-200 ${hoveredItem === "more" ? 'text-black dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`} />
                </motion.span>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {isMoreMenuOpen && (
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 shadow-xl" 
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
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => window.location.href = '/about'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900 dark:text-zinc-100 font-medium">About</span>
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => window.location.href = '/contact'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="text-gray-900 dark:text-zinc-100 font-medium">Contact</span>
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => window.location.href = '/faq'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <HelpCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-gray-900 dark:text-zinc-100 font-medium">FAQ</span>
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => window.location.href = '/privacy-policy'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-red-600" />
                        <span className="text-gray-900 dark:text-zinc-100 font-medium">Privacy Policy</span>
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-900 dark:text-zinc-100 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg"
                      onClick={() => window.location.href = '/terms-of-service'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-2"
                      >
                        <Terms className="w-4 h-4 text-gray-700" />
                        <span className="text-gray-900 dark:text-zinc-100 font-medium">Terms of Service</span>
                      </motion.div>
                    </DropdownMenuItem>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-zinc-800/80 my-1.5" />
                    
                    {/* Made with love */}
                    <div className="px-3 py-1 flex items-center justify-center gap-1 text-[10px] text-gray-500 dark:text-zinc-550 select-none">
                      <span>Made with</span>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                        className="inline-flex"
                      >
                        <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
                      </motion.div>
                      <span>by sleepsweety</span>
                    </div>
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}