"use client"

import React, { useState, useMemo } from 'react'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  title: string
  content: string
  section: string
  type: 'panel' | 'feature' | 'tutorial' | 'general'
  relevance: number
}

interface WikiSearchProps {
  onSearchResults: (results: SearchResult[]) => void
  onSearchQuery: (query: string) => void
}

const WikiSearch: React.FC<WikiSearchProps> = ({ onSearchResults, onSearchQuery }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Wiki içeriği - gerçek içerikler
  const wikiContent = useMemo(() => [
    {
      id: 'layers-panel',
      title: 'Layers Panel',
      content: 'The Layers Panel is a powerful tool that enables users to organize their effects into a more structured and manageable format. Through this panel, users can break down their effects into separate layers, allowing them to control each component independently. This approach makes complex effects more comprehensible and easier to modify. The panel not only allows for layer creation but also enables users to define specific settings for each layer. For instance, individual height values can be assigned to each layer on the 2D canvas. Additionally, custom parameters can be set for all elements within a layer, enabling detailed customization.',
      section: 'Panels Guide',
      type: 'panel' as const
    },
    {
      id: 'tools-panel',
      title: 'Tools Panel',
      content: 'The Tools Panel contains the essential drawing tools that users need when creating effects on the 2D canvas. Through this panel, different drawing methods and shape addition options can be utilized. Drawing Tools include Select Tool, Free Draw Tool, Shape Tools (circles, squares, lines), and Eraser Tool. Users can determine how many shapes to add and what color to add them in through the panel. Advanced options include Snap to Grid and Mirror Mode.',
      section: 'Panels Guide',
      type: 'panel' as const
    },
    {
      id: 'properties-panel',
      title: 'Properties Panel',
      content: 'The Properties Panel is a section where users can make special settings for the selected layer. Through this panel, the effect\'s behavior, the particle type to be used, and targeting options can be easily managed. Main features include Particle Name Selection, Targeter Selection, and MythicMobs Effect Types integration.',
      section: 'Panels Guide',
      type: 'panel' as const
    },
    {
      id: 'modes-panel',
      title: 'Modes Panel',
      content: 'The Modes Panel is a section that allows users to add various animations and behaviors to the elements they create. Through this panel, effects are not just static visuals but become dynamic and more attention-grabbing. Animation modes include Global Rotate, Self Rotate, Move, Dynamic Rainbow, Static Rainbow, Chain Sequence, and Action Recording.',
      section: 'Panels Guide',
      type: 'panel' as const
    },
    {
      id: 'code-edit-panel',
      title: 'Code Edit Panel',
      content: 'The Code Edit Panel is a tool within AuraFX that provides basic code editing functions. This panel allows users to make some code changes directly within AuraFX without needing an external editor like Visual Studio. Users can perform line-by-line editing, make simple modifications, and access layer-specific code directly.',
      section: 'Panels Guide',
      type: 'panel' as const
    },
    {
      id: 'action-recording-panel',
      title: 'Action Recording Panel',
      content: 'The Action Recording Panel is designed for the Action Recording mode. This panel records every operation performed by users in Action mode as a list, so all actions can be used later in code generation. Users can start and stop recording operations, view the chronological list of actions, and ensure that every detail is captured for automatic code generation.',
      section: 'Panels Guide',
      type: 'panel' as const
    },
    {
      id: 'code-panel',
      title: 'Code Panel',
      content: 'The Code Panel is the section where the output code of the created effect can be obtained and animation frame settings can be edited. This panel offers users the ability to control both the optimization of the effect and how the output will be generated. Main features include Code Output, Frame Setting, Circle Optimization, and Active Modes List.',
      section: 'Code Generation',
      type: 'feature' as const
    },
    {
      id: 'import-panel',
      title: 'Import Panel',
      content: 'The Import Panel is a module that allows users to transfer different types of files into AuraFX. Through this panel, images, models, animations, and pre-configured files can be easily uploaded to be added to effects. Supported formats include PNG Import, OBJ Import, GIF Import, and YAML Import (Experimental).',
      section: 'Import Operations',
      type: 'feature' as const
    },
    {
      id: 'performance-panel',
      title: 'Performance Panel',
      content: 'The Performance Panel is an optimization tool developed to ensure that created effects do not create excessive load on game servers. This panel proportionally reduces the number of added elements, both improving performance and trying to maintain the effect\'s overall appearance. Element reduction methods include Grid Step, Center, and Random approaches.',
      section: 'Performance',
      type: 'feature' as const
    },
    {
      id: 'chain-panel',
      title: 'Chain Panel',
      content: 'The Chain Panel is the section where the Chain Sequence mode used in effects is managed. In this panel, all elements added with Chain Sequence are displayed in a sequential manner. Users can change this sequence as desired or add special control points between elements to arrange the effect\'s playback in a more detailed way.',
      section: 'Chain Management',
      type: 'feature' as const
    },
    {
      id: 'canvas-component',
      title: 'Canvas Component',
      content: 'The Canvas Component is the main interactive surface of the application, allowing users to create, edit, and interact with particle elements in 2.5D/3D space. This component contains all drawing logic, user inputs (mouse movements, clicks), tool management, and various viewing modes, equipped with various optimization techniques for high performance and rich user experience.',
      section: 'Canvas',
      type: 'feature' as const
    },
    {
      id: '3d-editor',
      title: '3D Editor Features',
      content: 'The 3D Editor provides advanced camera controls, optimization features, and powerful tools for creating and managing 3D scenes. It offers professional-grade functionality with VR support, import/export capabilities, and an intuitive user interface. Features include Blender-style Controls, View Modes, Performance Mode, Advanced Rendering, Transform Tools, Visual Features, and VR & Advanced Features.',
      section: '3D Editor',
      type: 'feature' as const
    },
    {
      id: 'camera-controls',
      title: 'Camera Controls',
      content: 'Professional Blender-style camera controls for 3D navigation. Middle mouse button for orbit, Shift + middle mouse for pan, Ctrl + middle mouse for zoom. Mouse wheel for quick zoom. Supports both perspective (FOV: 50°) and orthographic view modes. Smart zoom speed adapts to distance, constrained orbit prevents camera flipping, distance-based panning ensures consistent movement. Visual cursor feedback indicates current operation. Camera state is automatically saved and restored with scenes.',
      section: '3D Editor',
      type: 'feature' as const
    },
    {
      id: 'import-guide-tutorial',
      title: 'Import Operations Tutorial',
      content: 'Learn how to import PNG, GIF and OBJ files into AuraFX. This tutorial covers the basics of file import operations and how to use different file formats in your effects.',
      section: 'Video Tutorials',
      type: 'tutorial' as const
    },
    {
      id: 'basic-usage-tutorial',
      title: 'Basic Usage Tutorial',
      content: 'Learn the fundamental features of AuraFX and how to use them. This comprehensive tutorial covers all the basic operations and features you need to get started with AuraFX.',
      section: 'Video Tutorials',
      type: 'tutorial' as const
    },
    {
      id: '3d-usage-tutorial',
      title: '3D Editor Usage Tutorial',
      content: 'Learn to use the 3D editor to create advanced spatial effects. This tutorial covers 3D modeling, camera controls, and advanced 3D features.',
      section: 'Video Tutorials',
      type: 'tutorial' as const
    },
    {
      id: 'panels-guide-tutorial',
      title: 'Panels and Explanations Tutorial',
      content: 'Learn detailed explanations of all panels and how to use them. This comprehensive tutorial covers every panel in AuraFX and their specific functions.',
      section: 'Video Tutorials',
      type: 'tutorial' as const
    }
  ], [])

  const filterOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'panel', label: 'Panels' },
    { value: 'feature', label: 'Features' },
    { value: 'tutorial', label: 'Tutorials' }
  ]

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const filtered = wikiContent.filter(item => {
      const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter
      const matchesQuery = 
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.section.toLowerCase().includes(query)
      
      return matchesFilter && matchesQuery
    })

    // Relevance scoring
    const scored = filtered.map(item => {
      let relevance = 0
      const titleMatch = item.title.toLowerCase().includes(query)
      const contentMatch = item.content.toLowerCase().includes(query)
      const sectionMatch = item.section.toLowerCase().includes(query)

      if (titleMatch) relevance += 3
      if (sectionMatch) relevance += 2
      if (contentMatch) relevance += 1

      return { ...item, relevance }
    })

    return scored.sort((a, b) => b.relevance - a.relevance)
  }, [searchQuery, selectedFilter, wikiContent])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearchQuery(query)
    onSearchResults(searchResults)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearchQuery('')
    onSearchResults([])
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Compact Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="w-full pl-10 pr-8 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/40 transition-all duration-200 text-sm"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Compact Filter */}
      {searchQuery && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-gray-300 hover:text-white transition-colors"
          >
            <Filter className="h-3 w-3" />
            <span>Filter</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-xs text-gray-400">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Compact Filter Options */}
      <AnimatePresence>
        {showFilters && searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="flex gap-1 p-2 bg-white/5 rounded-lg">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFilter(option.value)}
                  className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                    selectedFilter === option.value
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Search Results */}
      <AnimatePresence>
        {searchQuery && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 space-y-1 max-h-64 overflow-y-auto bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10"
          >
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 bg-white/5 rounded hover:bg-white/10 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  const elements = document.querySelectorAll('h3, h2, h1')
                  for (const element of elements) {
                    if (element.textContent?.toLowerCase().includes(result.title.toLowerCase())) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      element.classList.add('ring-1', 'ring-white/50')
                      setTimeout(() => {
                        element.classList.remove('ring-1', 'ring-white/50')
                      }, 1500)
                      break
                    }
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium text-sm truncate">{result.title}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    result.type === 'panel' ? 'bg-white/20 text-white' :
                    result.type === 'feature' ? 'bg-green-500/20 text-green-300' :
                    result.type === 'tutorial' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {result.type}
                  </span>
                </div>
                <p className="text-gray-400 text-xs truncate">{result.section}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact No Results */}
      <AnimatePresence>
        {searchQuery && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 bg-white/5 rounded-lg text-center"
          >
            <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">No results found</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WikiSearch
