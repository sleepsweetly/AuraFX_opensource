"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Hexagon, FileText, FolderOpen, Plus, Grid3X3, Box, BookOpen, Mail, HelpCircle, Shield, FileText as Terms, Info } from "lucide-react"
import { motion } from "framer-motion"

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

  return (
    <motion.div
      className="fixed top-4 left-4 z-40"
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut",
        type: "spring",
        stiffness: 200,
        damping: 25
      }}
    >
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black">
            <Hexagon className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">AuraFX</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Quick Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewProject}
          className="h-8 gap-1 hover:bg-gray-100 text-gray-700"
        >
          <Plus className="h-3 w-3" />
          <span className="text-xs">New</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="h-8 gap-1 hover:bg-gray-100 text-gray-700"
        >
          <FileText className="h-3 w-3" />
          <span className="text-xs">Save</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLoad}
          className="h-8 gap-1 hover:bg-gray-100 text-gray-700"
        >
          <FolderOpen className="h-3 w-3" />
          <span className="text-xs">Open</span>
        </Button>

        {/* Pages Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 hover:bg-gray-100 text-gray-700">
              <Grid3X3 className="h-3 w-3" />
              <span className="text-xs">Pages</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200" sideOffset={8}>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Editors
            </div>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => {
                // 3D modal'ını aç
                const event = new CustomEvent('open3DModal')
                window.dispatchEvent(event)
              }}
            >
              <Box className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium">3D Editor</div>
                <div className="text-xs text-gray-500">Advanced 3D particle effects</div>
              </div>
            </DropdownMenuItem>
            


            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100 mt-1">
              Resources
            </div>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => window.location.href = '/wiki'}
            >
              <BookOpen className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium">Wiki</div>
                <div className="text-xs text-gray-500">Documentation & guides</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 hover:bg-gray-100 text-gray-700">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200" sideOffset={8}>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Help & Legal
            </div>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => window.location.href = '/about'}
            >
              <Info className="w-4 h-4 text-blue-600" />
              About
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => window.location.href = '/contact'}
            >
              <Mail className="w-4 h-4 text-green-600" />
              Contact
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => window.location.href = '/faq'}
            >
              <HelpCircle className="w-4 h-4 text-yellow-600" />
              FAQ
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => window.location.href = '/privacy-policy'}
            >
              <Shield className="w-4 h-4 text-red-600" />
              Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-900 cursor-pointer flex items-center gap-2"
              onClick={() => window.location.href = '/terms-of-service'}
            >
              <Terms className="w-4 h-4 text-gray-700" />
              Terms of Service
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
