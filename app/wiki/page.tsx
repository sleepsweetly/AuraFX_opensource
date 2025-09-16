"use client"

import React, { useState } from 'react'
import { Hexagon, Home, Search, Calendar, Play, FileText, Wrench, Palette, Zap, Database, Globe, HelpCircle, ChevronRight, Layers, MousePointer, Pencil, Circle, Square, Minus, Eraser, Upload, Settings, Wand2, Link2, Video, Code, Code2, Box, BookOpen, X, Download, DollarSign, Laptop, HeadphonesIcon, Smartphone, Shield, Lightbulb, Users, Gamepad2, Camera } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Beams from '@/components/wiki/Beams'
import SplitText from '@/components/SplitText'
import ClickSpark from '@/components/wiki/ClickSpark'
import BubbleMenu from '@/components/wiki/BubbleMenu'
import WikiSearch from '@/components/wiki/WikiSearch'
import '@/components/wiki/Beams.css'

type TutorialVideo = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  color: string;
  videoUrl: string;
};

const WikiNewPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);

  const tutorialVideos = [
    {
      id: 'import-guide',
      title: 'Import Operations',
      description: 'Learn how to import and manage your projects in AuraFX',
      duration: '4:24',
      level: 'Beginner',
      color: 'blue',
      videoUrl: 'https://www.youtube.com/embed/zAPgMjKjLqg'
    },
    {
      id: 'basic-usage',
      title: 'Basic Usage Guide',
      description: 'Master the fundamentals of AuraFX with this comprehensive tutorial',
      duration: '12:45',
      level: 'Beginner',
      color: 'green',
      videoUrl: 'https://www.youtube.com/embed/1Ld4i5Uj8LA'
    },
    {
      id: '3d-usage',
      title: '3D Editor Usage',
      description: 'Explore the powerful 3D editing capabilities of AuraFX',
      duration: '4:10',
      level: 'Intermediate',
      color: 'purple',
      videoUrl: 'https://www.youtube.com/embed/fLqQBk03BJg'
    },
    {
      id: 'panels-guide',
      title: 'Panels Guide',
      description: 'Complete guide to all panels and their functions in AuraFX',
      duration: '18:15',
      level: 'Intermediate',
      color: 'orange',
      videoUrl: 'https://www.youtube.com/embed/_R0iyTshXEw'
    }
  ];

  // MythicMobs tarzında sidebar menü yapısı
  const sidebarSections = [
    {
      title: "Getting Started",
      items: [
        { name: "Home", href: "#home", icon: Home },
      ]
    },
    {
      title: "Guides",
      items: [
        { name: "FAQ", href: "#faq", icon: HelpCircle },
        { name: "About", href: "#about", icon: HelpCircle },
        { name: "Support", href: "#support", icon: HeadphonesIcon },
        { name: "Privacy Policy", href: "#privacy", icon: Shield },
        { name: "Terms of Service", href: "#terms", icon: FileText },
      ]
    },
    {
      title: "Panels",
      items: [
        { name: "Layers Panel", href: "#layers-panel", icon: Layers },
        { name: "Tools Panel", href: "#tools-panel", icon: Wrench },
        { name: "Canvas Panel", href: "#canvas-panel", icon: Palette },
        { name: "Settings Panel", href: "#settings-panel", icon: Settings },
        { name: "Modes Panel", href: "#modes-panel", icon: Play },
        { name: "Code Edit Panel", href: "#code-edit-panel", icon: Code },
        { name: "Code Panel", href: "#code-panel", icon: FileText },
        { name: "Action Recording Panel", href: "#action-recording-panel", icon: Camera },
      ]
    },
    {
      title: "3D Editor",
      items: [
        { name: "3D Editor Usage", href: "#3d-editor", icon: Box },
      ]
    },
    {
      title: "Tutorials",
      items: [
        { name: "Video Tutorials", href: "#video-tutorials", icon: Video },
      ]
    }
  ];

  // Tüm menü öğelerini arama için hazırla
  const allMenuItems = sidebarSections.flatMap(section => 
    section.items.map(item => ({
      ...item,
      section: section.title,
      id: item.href.replace('#', ''),
      title: item.name
    }))
  );

  // Arama fonksiyonu
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = allMenuItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.section.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Bölüm seçme fonksiyonu
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const wikiMenuItems = [
    {
      label: 'Getting Started',
      href: '#',
      ariaLabel: 'Getting Started',
      rotation: -8,
      hoverStyles: { bgColor: '#ffffff', textColor: '#000000' },
      onClick: () => setActiveSection('home')
    },
    {
      label: 'Panels',
      href: '#panels-guide',
      ariaLabel: 'Panels Guide',
      rotation: 8,
      hoverStyles: { bgColor: '#ffffff', textColor: '#000000' },
      onClick: () => setActiveSection('modes-panel')
    },
    {
      label: 'Canvas',
      href: '#canvas-component',
      ariaLabel: 'Canvas Component',
      rotation: 8,
      hoverStyles: { bgColor: '#ffffff', textColor: '#000000' },
      onClick: () => setActiveSection('canvas-panel')
    },
    {
      label: '3D Editor',
      href: '#3d-editor',
      ariaLabel: '3D Editor Features',
      rotation: 8,
      hoverStyles: { bgColor: '#ffffff', textColor: '#000000' },
      onClick: () => setActiveSection('3d-editor')
    },
    {
      label: 'Tutorials',
      href: '#video-tutorials',
      ariaLabel: 'Video Tutorials',
      rotation: -8,
      hoverStyles: { bgColor: '#ffffff', textColor: '#000000' },
      onClick: () => setActiveSection('video-tutorials')
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">

      {/* Fixed BubbleMenu */}
      <BubbleMenu
        logo={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 700, 
            color: '#111',
            fontSize: '18px',
            height: '100%',
            width: '100%'
          }}>
            <Hexagon size={24} color="#ffffff" />
            <span>AuraFX</span>
            <Hexagon size={24} color="#ffffff" />
          </div>
        }
        items={wikiMenuItems}
        menuAriaLabel="Toggle navigation"
        menuBg="#ffffff"
        menuContentColor="#111111"
        useFixedPosition={true}
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.12}
      />

      {/* Background Beams - Fixed */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>

      {/* Main Layout - MythicMobs Style */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-80 bg-black/80 backdrop-blur-xl border-r border-white/20 p-6 pt-32 overflow-y-auto">
          {/* Search Section */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search the wiki..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Search Results</p>
                {searchResults.slice(0, 5).map((result, index) => (
                  <a
                    key={index}
                    href={result.href}
                    className="block px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <result.icon className="w-3 h-3 text-gray-400 group-hover:text-white" />
                      <span>{result.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{result.section}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <button
                        onClick={() => handleSectionClick(item.href.replace('#', ''))}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 group ${
                          activeSection === item.href.replace('#', '') 
                            ? 'bg-white/10 text-white' 
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        <span className="text-sm">{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 pt-32">
          {!activeSection && (
            /* Hero Section */
            <div className="text-center mb-12">
              <ClickSpark
                sparkColor='#fff'
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
              >
                <div className="text-center">
                  <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
                    <SplitText
                      text="AuraFX Wiki"
                      className="text-white font-black tracking-tight"
                      tag="span"
                      delay={100}
                      duration={0.8}
                      ease="power3.out"
                      splitType="chars"
                      from={{ opacity: 0, y: 50, rotationX: 90 }}
                      to={{ opacity: 1, y: 0, rotationX: 0 }}
                      threshold={0.1}
                      rootMargin="-100px"
                      textAlign="center"
                    />
                  </h1>
                  <p className="text-gray-400 text-xl md:text-2xl font-light tracking-wide">
                    <SplitText
                      text="Documentation & Tutorials"
                      className="text-gray-300 font-light tracking-wide"
                      tag="span"
                      delay={150}
                      duration={0.6}
                      ease="power2.out"
                      splitType="chars"
                      from={{ opacity: 0, y: 30, scale: 0.8 }}
                      to={{ opacity: 1, y: 0, scale: 1 }}
                      threshold={0.1}
                      rootMargin="-100px"
                      textAlign="center"
                    />
                  </p>
                </div>
              </ClickSpark>
            </div>
          )}

          {/* Home Section */}
          {activeSection === 'home' && (
            <motion.section 
              id="home"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Welcome to AuraFX</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                AuraFX is a powerful visual effects creation platform that allows you to create stunning 2D and 3D effects for your projects. Whether you're a beginner or an advanced user, AuraFX provides all the tools you need to bring your creative visions to life.
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">What is AuraFX?</h3>
                  <p className="text-gray-300 mb-4">
                    AuraFX is a comprehensive visual effects editor that combines the power of 2D canvas editing with advanced 3D capabilities. Create everything from simple particle effects to complex 3D animations with an intuitive interface designed for both beginners and professionals.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  <ul className="text-gray-300 space-y-2 text-sm ml-4">
                    <li>• Advanced 2D Canvas Editor with layer management</li>
                    <li>• Powerful 3D Editor for spatial effects</li>
                    <li>• Real-time preview and rendering</li>
                    <li>• Export to multiple formats (PNG, GIF, OBJ)</li>
                    <li>• Intuitive user interface</li>
                    <li>• Comprehensive documentation and tutorials</li>
                  </ul>
                </div>
              </div>
            </motion.section>
          )}

          {/* Modes Panel - Individual Section */}
          {activeSection === 'modes-panel' && (
            <motion.section 
              id="modes-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Modes Panel – Animation & Behavior Effects</h2>
                  <p className="text-gray-400 text-lg">Add various animations and behaviors to create dynamic effects</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    The Modes Panel is a section that allows users to add various animations and behaviors to the elements they create. Through this panel, effects are not just static visuals but become dynamic and more attention-grabbing. Each mode takes on a different function and provides control over elements' movement, rotation, or color transitions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Animation Modes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Movement Animations</h5>
                          <p className="text-gray-300 text-sm">Create smooth movement patterns for particles and elements</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Rotation Effects</h5>
                          <p className="text-gray-300 text-sm">Add spinning and rotating behaviors to visual elements</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Color Transitions</h5>
                          <p className="text-gray-300 text-sm">Smooth color changes and gradient effects over time</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Scale Animations</h5>
                          <p className="text-gray-300 text-sm">Pulsing, growing, and shrinking effects for dynamic visuals</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Behavior Controls</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Timing Controls</h5>
                          <p className="text-gray-300 text-sm">Set duration, delay, and easing for smooth animations</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Loop Settings</h5>
                          <p className="text-gray-300 text-sm">Configure continuous or one-time animation cycles</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Trigger Conditions</h5>
                          <p className="text-gray-300 text-sm">Define when animations start and stop</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Intensity Control</h5>
                          <p className="text-gray-300 text-sm">Adjust animation strength and visual impact</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Dynamic Visuals</h4>
                      <p className="text-gray-300 text-sm">Transform static effects into engaging, animated experiences</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Professional Quality</h4>
                      <p className="text-gray-300 text-sm">Create cinematic and game-ready animation effects</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Easy Control</h4>
                      <p className="text-gray-300 text-sm">Intuitive interface for complex animation management</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Performance Optimized</h4>
                      <p className="text-gray-300 text-sm">Smooth animations without impacting system performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Code Edit Panel - Individual Section */}
          {activeSection === 'code-edit-panel' && (
            <motion.section 
              id="code-edit-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Code Edit Panel – Built-in Code Editing & Layer Management</h2>
                  <p className="text-gray-400 text-lg">Built-in code editing functions with MythicScribe integration</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    The Code Edit Panel is a tool within AuraFX that provides basic code editing functions. This panel allows users to make some code changes directly within AuraFX without needing an external editor like Visual Studio. Users can perform line-by-line editing, make simple modifications, and access layer-specific code directly. The panel includes MythicScribe suggestions and provides essential features for quick code adjustments.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Code Editing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Line-by-Line Editing</h5>
                          <p className="text-gray-300 text-sm">Precise code modification with syntax highlighting</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Syntax Highlighting</h5>
                          <p className="text-gray-300 text-sm">Color-coded syntax for better code readability</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Auto-Complete</h5>
                          <p className="text-gray-300 text-sm">Intelligent code suggestions and completion</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Error Detection</h5>
                          <p className="text-gray-300 text-sm">Real-time syntax error identification and warnings</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">MythicScribe Integration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Smart Suggestions</h5>
                          <p className="text-gray-300 text-sm">Context-aware code recommendations</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Template Library</h5>
                          <p className="text-gray-300 text-sm">Pre-built code templates for common effects</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Quick Fixes</h5>
                          <p className="text-gray-300 text-sm">Automated suggestions for code improvements</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Documentation</h5>
                          <p className="text-gray-300 text-sm">Inline help and function documentation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Integrated Workflow</h4>
                      <p className="text-gray-300 text-sm">Edit code without leaving the AuraFX environment</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Time Efficient</h4>
                      <p className="text-gray-300 text-sm">Quick code adjustments without external tools</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">User Friendly</h4>
                      <p className="text-gray-300 text-sm">Intuitive interface for both beginners and experts</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Layer Integration</h4>
                      <p className="text-gray-300 text-sm">Direct access to layer-specific code sections</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Code Panel - Individual Section */}
          {activeSection === 'code-panel' && (
            <motion.section 
              id="code-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Code Panel – Code Generation & Output Settings</h2>
                  <p className="text-gray-400 text-lg">Code generation and output settings for MythicMobs integration</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    The Code Panel is the section where the output code of the created effect can be obtained and animation frame settings can be edited. This panel offers users the ability to control both the optimization of the effect and how the output will be generated.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Main Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Code Output</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">MythicMobs Compatible Output</h5>
                          <p className="text-gray-300 text-sm">Users can obtain the code of their created effect from here. The code is generated to be compatible with MythicMobs.</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Copy to Clipboard</h5>
                          <p className="text-gray-300 text-sm">One-click copy functionality for easy code transfer</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Syntax Highlighting</h5>
                          <p className="text-gray-300 text-sm">Color-coded syntax for better code readability</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Export Options</h5>
                          <p className="text-gray-300 text-sm">Multiple export formats for different use cases</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Frame Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Animation Frames</h5>
                          <p className="text-gray-300 text-sm">Determines how many frames the animation will consist of</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">More Frames</h5>
                          <p className="text-gray-300 text-sm">Smoother animation with higher frame count</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Fewer Frames</h5>
                          <p className="text-gray-300 text-sm">Shorter code and lower processing load</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Custom Frame Rate</h5>
                          <p className="text-gray-300 text-sm">Adjustable frame rate for optimal performance</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Circle Optimization</h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300 text-sm mb-3">
                          This feature, recommended by a <strong>staff member</strong> from the MythicMobs Discord server, calculates the radius of shapes added with the <strong>Circle Tool</strong> to reduce unnecessary lines in code generation. This results in more efficient and shorter codes.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <h6 className="text-white font-medium mb-1">Automatic Radius Calculation</h6>
                            <p className="text-gray-300 text-xs">Smart radius detection for circles</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <h6 className="text-white font-medium mb-1">Code Line Reduction</h6>
                            <p className="text-gray-300 text-xs">Minimizes unnecessary code lines</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <h6 className="text-white font-medium mb-1">Efficiency Improvement</h6>
                            <p className="text-gray-300 text-xs">Optimized performance output</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Active Modes List</h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300 text-sm mb-3">
                          Users can see which modes (e.g., Global Rotate, Dynamic Rainbow, etc.) are active from this panel. This way, it's easy to track which animations or settings will be included in the output.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <h6 className="text-white font-medium mb-1">Real-time Mode Status</h6>
                            <p className="text-gray-300 text-xs">Live tracking of active modes</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <h6 className="text-white font-medium mb-1">Output Preview</h6>
                            <p className="text-gray-300 text-xs">Preview generated code before export</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <h6 className="text-white font-medium mb-1">Mode Configuration</h6>
                            <p className="text-gray-300 text-xs">Track mode settings and parameters</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Complete Control</h4>
                      <p className="text-gray-300 text-sm">Full control over code output and optimization</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">MythicMobs Integration</h4>
                      <p className="text-gray-300 text-sm">Seamless compatibility with MythicMobs ecosystem</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Performance Optimization</h4>
                      <p className="text-gray-300 text-sm">Optimize effects for both quality and performance</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Easy Export</h4>
                      <p className="text-gray-300 text-sm">One-click code generation and export</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Action Recording Panel - Individual Section */}
          {activeSection === 'action-recording-panel' && (
            <motion.section 
              id="action-recording-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Action Recording Panel – Action Recording & Operation Tracking</h2>
                  <p className="text-gray-400 text-lg">Record and track user operations for code generation</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    The Action Recording Panel is designed for the Action Recording mode. This panel records every operation performed by users in Action mode as a list, so all actions can be used later in code generation. It provides a comprehensive log of user interactions, enabling the creation of complex effect sequences through recorded actions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Action Recording</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Real-time Recording</h5>
                          <p className="text-gray-300 text-sm">Capture every user action as it happens</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Action Timeline</h5>
                          <p className="text-gray-300 text-sm">Visual timeline of all recorded operations</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Operation Details</h5>
                          <p className="text-gray-300 text-sm">Detailed information about each recorded action</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Timestamp Tracking</h5>
                          <p className="text-gray-300 text-sm">Precise timing information for each action</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Code Generation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Automatic Conversion</h5>
                          <p className="text-gray-300 text-sm">Convert recorded actions into executable code</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Sequence Management</h5>
                          <p className="text-gray-300 text-sm">Organize and manage action sequences</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Export Options</h5>
                          <p className="text-gray-300 text-sm">Export recorded actions in various formats</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Playback Control</h5>
                          <p className="text-gray-300 text-sm">Review and replay recorded actions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Workflow Automation</h4>
                      <p className="text-gray-300 text-sm">Automate repetitive tasks through action recording</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Code Efficiency</h4>
                      <p className="text-gray-300 text-sm">Generate optimized code from user actions</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Learning Tool</h4>
                      <p className="text-gray-300 text-sm">Understand effect creation through recorded examples</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Reproducibility</h4>
                      <p className="text-gray-300 text-sm">Easily recreate complex effect sequences</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* About Section */}
          {activeSection === 'about' && (
            <motion.section 
              id="about"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">About AuraFX</h2>
                  <p className="text-gray-400 text-lg">Professional web-based particle effect generator for Minecraft</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Our Mission</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To make advanced effect creation easy, visual, and accessible to everyone in the Minecraft community.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Visual Editor</h4>
                      <p className="text-gray-300 text-sm">Visual drag-and-drop editor for 2D and 3D effects</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Auto Code Generation</h4>
                      <p className="text-gray-300 text-sm">Automatic YAML code generation for MythicMobs</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Import/Export</h4>
                      <p className="text-gray-300 text-sm">Import/export tools for PNG and OBJ files</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Layer System</h4>
                      <p className="text-gray-300 text-sm">Layer-based effect system and animation modes</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Community Support</h4>
                      <p className="text-gray-300 text-sm">Community support, documentation, and tutorials</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Cross-Platform</h4>
                      <p className="text-gray-300 text-sm">Mobile and desktop compatibility</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Community & Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Join Our Community</h4>
                      <p className="text-gray-300 text-sm">Connect with other creators, get help, and share your amazing effects with our Discord community.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Get in Touch</h4>
                      <p className="text-gray-300 text-sm">Have questions, feedback, or business inquiries? We'd love to hear from you.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Support Section */}
          {activeSection === 'support' && (
            <motion.section 
              id="support"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <HeadphonesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Support</h2>
                  <p className="text-gray-400 text-lg">Get help and support for AuraFX</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Contact Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Quick Contact</h4>
                      <p className="text-gray-300 text-sm">Use our contact form for the fastest response, or email us directly for urgent matters.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Discord Community</h4>
                      <p className="text-gray-300 text-sm">Join our active community for live support, discussions, and sharing your creations.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Business Inquiries</h4>
                      <p className="text-gray-300 text-sm">Interested in partnerships, collaborations, or custom development? Let's talk!</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Response Times</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Discord</h4>
                      <p className="text-gray-300 text-sm">Usually within a few hours</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Email</h4>
                      <p className="text-gray-300 text-sm">Within 24-48 hours</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Business Inquiries</h4>
                      <p className="text-gray-300 text-sm">Within 2-3 business days</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Support the Project</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Donate via Binance</h4>
                      <p className="text-gray-300 text-sm">Support our development with a secure donation through Binance Pay.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Spread the Word</h4>
                      <p className="text-gray-300 text-sm">Share AuraFX with your friends and the Minecraft community to help us grow!</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Privacy Policy Section */}
          {activeSection === 'privacy' && (
            <motion.section 
              id="privacy"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Privacy Policy</h2>
                  <p className="text-gray-400 text-lg">How we collect and use your information</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Information We Collect</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Personal Information</h4>
                      <p className="text-gray-300 text-sm">Such as your email address, if you contact us or sign up for updates.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Usage Data</h4>
                      <p className="text-gray-300 text-sm">Information about how you use our site, including pages viewed, features used, and time spent.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Cookies & Tracking</h4>
                      <p className="text-gray-300 text-sm">We use cookies and similar technologies to enhance your experience and analyze site usage.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• To provide, operate, and maintain our website and services</li>
                    <li>• To improve, personalize, and expand our services</li>
                    <li>• To communicate with you, including support and updates</li>
                    <li>• To analyze usage and trends to improve user experience</li>
                    <li>• To comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Your Rights</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• You may request access to, correction of, or deletion of your personal data at any time</li>
                    <li>• You can opt out of cookies via your browser settings</li>
                    <li>• You can control personalized advertising through Google Ads Settings</li>
                  </ul>
                </div>
              </div>
            </motion.section>
          )}

          {/* Terms of Service Section */}
          {activeSection === 'terms' && (
            <motion.section 
              id="terms"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Terms of Service</h2>
                  <p className="text-gray-400 text-lg">Terms and conditions for using AuraFX</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Use of Service</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• You must be at least 13 years old to use this service</li>
                    <li>• Do not use the service for unlawful purposes or to harm others</li>
                    <li>• Do not attempt to disrupt, hack, or reverse engineer the service</li>
                    <li>• Respect the rights and privacy of other users</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">User Content</h3>
                  <p className="text-gray-300">
                    You are responsible for any content you create or upload using AuraFX. Do not upload or share content that is illegal, offensive, or infringes on others' rights.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Intellectual Property</h3>
                  <p className="text-gray-300">
                    All content, trademarks, and code on AuraFX are the property of their respective owners. You may not copy, distribute, or use any content without permission.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Disclaimer & Limitation of Liability</h3>
                  <p className="text-gray-300">
                    AuraFX is provided "as is" and without warranties of any kind. We are not liable for any damages, data loss, or issues arising from the use of this service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Changes to Terms</h3>
                  <p className="text-gray-300">
                    We reserve the right to update these Terms at any time. Continued use of the service after changes means you accept the new terms.
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Find answers to the most commonly asked questions about AuraFX and particle effect creation.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* General Questions */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">General Questions</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-white" />
                        What is AuraFX?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        AuraFX is a web-based tool for creating advanced particle effects for Minecraft servers using the MythicMobs plugin. It allows you to visually design, preview, and export effects without coding.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-white" />
                        Is AuraFX free?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Yes, AuraFX is completely free to use for everyone. We believe in making advanced effect creation accessible to all Minecraft creators.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-white" />
                        Do I need to know coding?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        No coding is required! You can design effects visually and export ready-to-use YAML code for MythicMobs.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-white" />
                        Who is behind AuraFX?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        AuraFX is developed by passionate Minecraft plugin developers and designers who understand the needs of server owners and creators.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Technical Questions */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Technical Questions</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-white" />
                        Can I use AuraFX on mobile?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Yes, AuraFX is optimized for both desktop and mobile devices. You can create effects on any device with a modern web browser.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-white" />
                        What Minecraft versions are supported?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        AuraFX generates effects compatible with MythicMobs, which supports most modern Minecraft versions. Check MythicMobs documentation for specific version compatibility.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-white" />
                        Can I import my own models?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Yes! You can import PNG images and OBJ 3D models to create custom particle effects based on your own designs.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Support & Privacy */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Support & Privacy</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <HeadphonesIcon className="w-5 h-5 text-white" />
                        How can I get support?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        You can contact us via email or join our Discord community for live help and discussions. Our community is very active and helpful!
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-white" />
                        Is my data safe?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        We take privacy seriously. Your data is never shared with third parties except as required for legal compliance. See our Privacy Policy for details.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-white" />
                        Can I contribute or suggest features?
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Absolutely! We welcome feedback and suggestions. Please contact us or join our Discord to share your ideas and help shape the future of AuraFX.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}


          {/* Layers Panel - Individual Section */}
          {activeSection === 'layers-panel' && (
            <motion.section 
              id="layers-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Layers Panel</h2>
                  <p className="text-gray-400 text-lg">Hierarchical Effect Organization & Layer Management</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Layers Panel is a comprehensive organizational interface that empowers users to structure complex visual effects into discrete, manageable layers. This panel facilitates a non-destructive, hierarchical workflow where each layer operates independently, enabling precise control over individual components of an effect. Users can assign unique properties—such as spatial height, particle behavior, and rendering priorities—to each layer, ensuring both creative flexibility and systematic oversight. The panel also supports layer grouping, visibility toggling, and real-time previewing, making it indispensable for designing multi-layered 2.5D/3D effects with clarity and efficiency.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Layer Stack Management</h4>
                  <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Drag & Drop Operations:</span> Create, delete, duplicate, and reorder layers via intuitive drag-and-drop operations</li>
                        <li>• <span className="text-white font-semibold">Layer Grouping:</span> Group layers into folders for logical organization of complex effect sequences</li>
                        <li>• <span className="text-white font-semibold">Visibility Control:</span> Toggle layer visibility and locking to isolate specific components during editing</li>
                  </ul>
                </div>
                    
                <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Per-Layer Customization</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Height Assignment:</span> Assign unique height (Z-axis) values to layers on the 2D canvas, simulating depth and parallax effects</li>
                        <li>• <span className="text-white font-semibold">Layer Parameters:</span> Define layer-specific parameters: opacity, blend modes, animation delays, and physics behaviors</li>
                        <li>• <span className="text-white font-semibold">Bulk Adjustments:</span> Apply bulk adjustments to all elements within a layer for consistent styling</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Advanced Layer Operations</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Masking Support:</span> Use layers as masks to create complex transparency and reveal effects</li>
                        <li>• <span className="text-white font-semibold">Template Layers:</span> Save frequently used layer configurations as reusable templates</li>
                        <li>• <span className="text-white font-semibold">Export/Import:</span> Share layer presets across projects or team members</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Visual Hierarchy Tools</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Color-coding:</span> Color-coding and labeling for rapid layer identification</li>
                        <li>• <span className="text-white font-semibold">Thumbnail Previews:</span> Miniature thumbnails showing layer content previews</li>
                        <li>• <span className="text-white font-semibold">Search & Filter:</span> Search and filter layers by name, type, or tags</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Enhanced Organization</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Simplifies management of intricate effects by decomposing them into modular layers.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Granular Control</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Independent adjustment of layer properties without affecting other elements.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Non-Destructive Editing</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Experiment freely with layer settings while preserving original data.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Collaboration Ready</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Clear layer structure facilitates team-based workflows and version control.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Scalability</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Efficiently handle projects ranging from simple animations to cinematic-grade sequences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Tools Panel - Individual Section */}
          {activeSection === 'tools-panel' && (
            <motion.section 
              id="tools-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Tools Panel</h2>
                  <p className="text-gray-400 text-lg">Precision Drawing Instruments & Canvas Manipulation Utilities</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Tools Panel serves as the primary control hub for all creative operations on the 2D canvas, providing a curated suite of precision instruments for designing, manipulating, and refining visual effects. This panel integrates intuitive drawing tools, dynamic element configuration options, and advanced spatial controls to streamline the effect creation process. Designed for both rapid prototyping and detailed craftsmanship, it empowers users to translate creative vision into structured particle-based animations with efficiency and artistic control.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Core Toolset</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Drawing & Manipulation Tools</h4>
                  <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Select Tool:</span> Enables precise selection, transformation (scale/rotate), and repositioning of canvas elements with bounding-box controls</li>
                        <li>• <span className="text-white font-semibold">Free Draw Tool:</span> Offers pressure-sensitive freehand drawing with customizable brush size, hardness, and opacity settings</li>
                        <li>• <span className="text-white font-semibold">Shape Tools:</span> Generates parametric geometric primitives (circles, rectangles, polygons, lines) with real-time dimension editing</li>
                        <li>• <span className="text-white font-semibold">Eraser Tool:</span> Provides granular deletion capabilities with adjustable eraser size and hardness for partial or full element removal</li>
                  </ul>
                </div>
                    
                <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Element Configuration</h4>
                  <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Count & Density Control:</span> Specify the number of particles or instances generated per drawn element (e.g., 10 particles per circle)</li>
                        <li>• <span className="text-white font-semibold">Color Palette Integration:</span> Assign fill/stroke colors using HEX/RGB inputs or preset swatches, with support for gradient and texture mapping</li>
                        <li>• <span className="text-white font-semibold">Particle Attribution:</span> Link drawn shapes to specific particle types defined in the Properties Panel for visual consistency</li>
                  </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Advanced Spatial Controls</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Snap to Grid:</span> Forces elements to align with a configurable grid (px/cm units) for precision layout design</li>
                        <li>• <span className="text-white font-semibold">Mirror Mode:</span> Creates real-time symmetrical duplicates across X/Y axes or custom angles for balanced compositions</li>
                        <li>• <span className="text-white font-semibold">Guides & Rulers:</span> Toggle visual guides for proportional spacing and alignment</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Shape Management System</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Shape Library:</span> Lists all added elements with thumbnail previews, names, and creation timestamps</li>
                        <li>• <span className="text-white font-semibold">Bulk Editing:</span> Select multiple shapes to uniformly update properties (color, count, scale) across selections</li>
                        <li>• <span className="text-white font-semibold">History Stack:</span> Undo/redo tool operations with depth-based history tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Integration Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Layer-Aware Tools</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Automatically assigns new elements to the active layer in the Layers Panel for seamless workflow integration.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">MythicMobs Export Ready</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Ensures all drawn elements comply with MythicMobs coordinate and scaling standards for direct export compatibility.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Workflow Efficiency</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Reduces design iteration time with quick-access tools and parametric controls.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Pixel-Perfect Precision</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Achieve exact placements and proportions with grid snapping and numeric inputs.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Creative Flexibility</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Seamlessly switch between organic freehand drawing and structured geometric design.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Collaboration Friendly</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Standardized tool behaviors ensure consistent results across team members.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Canvas Panel - Individual Section */}
          {activeSection === 'canvas-panel' && (
            <motion.section 
              id="canvas-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Canvas Component</h2>
                  <p className="text-gray-400 text-lg">Interactive 2.5D/3D Drawing Surface</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Canvas Component serves as the core interactive interface of the application, empowering users to seamlessly create, manipulate, and engage with particle-based elements within a dynamic 2.5D/3D environment. This component integrates advanced drawing algorithms, real-time user input handling (including mouse gestures and click events), multi-tool management, and diverse viewing perspectives—all optimized for high-performance rendering and an immersive user experience.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Core Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Multi-Tool Functionality</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Free Drawing Tool:</span> Enables organic, hand-drawn strokes with customizable brush properties</li>
                        <li>• <span className="text-white font-semibold">Selection & Manipulation:</span> Allows precise element selection, transformation, and spatial adjustment</li>
                        <li>• <span className="text-white font-semibold">Geometric Shape Tools:</span> Supports creation of circles, squares, lines, and other primitives with parametric controls</li>
                    </ul>
                  </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">2.5D/3D Viewing Modes</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Orthographic Views:</span> Top, Front, and Side perspectives for technical precision</li>
                        <li>• <span className="text-white font-semibold">Angular Perspectives:</span> Diagonal and Isometric views for spatial depth</li>
                        <li>• <span className="text-white font-semibold">Dynamic Camera Controls:</span> Zoom, pan, and rotate functionalities for intuitive navigation</li>
                      </ul>
                </div>
                    
                <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Advanced Operational Modes</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Action Recording:</span> Captures user interactions in real-time (at 60 FPS) for playback, animation sequencing, and undo/redo operations</li>
                        <li>• <span className="text-white font-semibold">Chain Mode:</span> Facilitates creation of timed animation chains with sequential trigger support</li>
                        <li>• <span className="text-white font-semibold">Mirror Mode:</span> Generates real-time symmetrical duplicates across user-defined axes for balanced designs</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Optimization Techniques</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Batch Rendering</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Groups visual elements by attributes (e.g., color, type) and renders them in consolidated batches to minimize GPU context switches and enhance frame rates.
                  </p>
                </div>
                    
                <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Web Worker Integration</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Offloads computationally intensive tasks (e.g., selection hit-detection, spatial calculations) to background threads, ensuring UI responsiveness during heavy operations.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Performance Mode</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Reduces rendering load by 50% via alternate-frame rendering while preserving visual coherence, ideal for large-scale projects.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Event Throttling</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Optimizes action recording by capping events at 60 FPS to prevent redundant state updates and minimize memory usage.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Canvas Component delivers a robust, high-performance drawing surface capable of handling thousands of elements without lag. Its combination of rich interaction tools, multi-perspective workflows, and optimized rendering makes it ideal for professional-grade visual effects, educational demonstrations, and interactive art projects.
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Settings Panel - Individual Section */}
          {activeSection === 'settings-panel' && (
            <motion.section 
              id="settings-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Properties Panel</h2>
                  <p className="text-gray-400 text-lg">Layer Configuration & Advanced Settings</p>
                </div>
              </div>
              
              <div className="space-y-6">
              <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Properties Panel is a dynamic interface module designed for granular control over selected layers within the application. It enables users to define and fine-tune behavioral attributes, particle-based visual properties, and targeting mechanics for visual effects. Fully integrated with MythicMobs (a popular Minecraft plugin), this panel ensures seamless compatibility with Minecraft's effect ecosystem while offering intuitive customization for both novice and advanced users.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Particle Selection System</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Particle Type Assignment:</span> Allows users to assign specific particle types (e.g., flame, smoke, redstone) to layers, defining the core visual identity of effects</li>
                        <li>• <span className="text-white font-semibold">Custom Libraries:</span> Supports custom particle libraries and predefined sets for rapid prototyping</li>
                        <li>• <span className="text-white font-semibold">Real-time Preview:</span> Real-time preview of particle choices to streamline the design process</li>
                  </ul>
                </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Targeting Configuration</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Spatial Targeting:</span> Provides dropdown menus and parametric controls to set the effect's spatial target (e.g., point, area, entity, or directional vector)</li>
                        <li>• <span className="text-white font-semibold">Dynamic Targeting:</span> Includes options for static and dynamic targeting (e.g., following entities or projecting along trajectories)</li>
                        <li>• <span className="text-white font-semibold">Directional Control:</span> Enables precise directional manipulation for effects requiring orientation-based behavior (e.g., beams, cones, or radial bursts)</li>
                  </ul>
              </div>

              <div>
                      <h4 className="text-lg font-semibold text-white mb-3">MythicMobs Integration Suite</h4>
                      <ul className="text-gray-300 space-y-2 text-sm ml-4">
                        <li>• <span className="text-white font-semibold">Native Effect Types:</span> Direct access to MythicMobs-native effect types (e.g., circle, line, explosion) through a unified dropdown interface</li>
                        <li>• <span className="text-white font-semibold">Automatic Mapping:</span> Automatically maps AuraFX layer properties to MythicMobs-compatible output, ensuring effortless export and deployment in Minecraft environments</li>
                        <li>• <span className="text-white font-semibold">Metadata Support:</span> Supports MythicMobs metadata tags for advanced users seeking deeper engine-level customization</li>
                  </ul>
                </div>
                </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Additional Capabilities</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Layer-Specific Parameters</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Adjust scale, opacity, animation speed, and physics behavior (e.g., gravity, fade-out) for each layer independently.
                      </p>
              </div>

              <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Preset Management</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Save/load frequently used configurations to maintain consistency across projects and streamline workflow.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Validation Checks</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Warns users about incompatible settings between AuraFX and MythicMobs pre-export to prevent configuration errors.
                      </p>
                    </div>
                  </div>
              </div>

              <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Properties Panel bridges creative design and technical implementation, offering a centralized hub for configuring complex effect layers. Its deep integration with MythicMobs accelerates workflow for Minecraft content creators, while its modular design ensures flexibility for standalone use in other 2.5D/3D projects.
                  </p>
              </div>
            </div>
            </motion.section>
          )}

          {/* 3D Editor Usage - Individual Section */}
          {activeSection === '3d-editor' && (
            <motion.section 
              id="3d-editor"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">3D Editor – Professional 3D Scene Creation & Advanced Visualization Tools</h2>
                  <p className="text-gray-400 text-lg">Sophisticated environment for creating, manipulating, and rendering complex 3D scenes</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    The 3D Editor is a sophisticated environment designed for creating, manipulating, and rendering complex 3D scenes with studio-level precision. It combines industry-standard camera controls, advanced optimization systems, and a comprehensive toolset tailored for particle effect design and 3D scene composition. With seamless import/export pipelines and an intuitive interface, it empowers artists and developers to build high-quality effects while maintaining optimal performance across diverse hardware configurations.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Camera Control System</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Professional Navigation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Orbit (MMB)</h5>
                          <p className="text-gray-300 text-sm">Rotate around a user-defined pivot point by holding the Middle Mouse Button and dragging</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Pan (Shift + MMB)</h5>
                          <p className="text-gray-300 text-sm">Translate the camera parallel to the view plane while maintaining focus</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Zoom (Ctrl + MMB)</h5>
                          <p className="text-gray-300 text-sm">Dolly the camera toward/away from the target with dynamic speed scaling</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Mouse Wheel Zoom</h5>
                          <p className="text-gray-300 text-sm">Adjust zoom level incrementally with adaptive sensitivity</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">View Mode Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Perspective View</h5>
                          <p className="text-gray-300 text-sm">Natural perspective with 50° field of view for organic scene design</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Orthographic View</h5>
                          <p className="text-gray-300 text-sm">Technical view without perspective distortion for precise measurements</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Advanced Camera Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Auto-Save State</h5>
                          <p className="text-gray-300 text-sm">Camera position and settings are preserved between sessions</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Constraint-Based Orbit</h5>
                          <p className="text-gray-300 text-sm">Prevents gimbal lock and maintains intuitive navigation</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Distance-Aware Panning</h5>
                          <p className="text-gray-300 text-sm">Pan speed adjusts based on camera distance for consistent control</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Visual Cursor Feedback</h5>
                          <p className="text-gray-300 text-sm">Dynamic cursor icons indicate active navigation mode</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Optimization & Rendering</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Performance Mode</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Dynamic Resolution Scaling</h5>
                          <p className="text-gray-300 text-sm">Automatically adjusts rendering quality based on system capability</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Shadow Optimization</h5>
                          <p className="text-gray-300 text-sm">Adaptive shadow quality based on scene complexity</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Instanced Rendering</h5>
                          <p className="text-gray-300 text-sm">Reduces GPU overhead by reusing geometry for identical objects</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Advanced Rendering Engine</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Background Processing</h5>
                          <p className="text-gray-300 text-sm">Offloads complex calculations to maintain UI responsiveness</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Batch Drawing</h5>
                          <p className="text-gray-300 text-sm">Minimizes state changes by aggregating similar rendering operations</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Adaptive Renderer</h5>
                          <p className="text-gray-300 text-sm">Automatically switches techniques based on scene requirements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">3D Tools & Utilities</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Transform Tools</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Select (Q)</h5>
                          <p className="text-gray-300 text-sm">Object selection with marquee and click selection</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Move (W)</h5>
                          <p className="text-gray-300 text-sm">Precise positioning along constrained axes or free movement</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Rotate (E)</h5>
                          <p className="text-gray-300 text-sm">Euler rotations with gizmo support and numeric input</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Scale (R)</h5>
                          <p className="text-gray-300 text-sm">Uniform and non-uniform scaling with precision controls</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Visualization Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Adaptive Grid</h5>
                          <p className="text-gray-300 text-sm">Dynamic grid system that adjusts to zoom level</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Axes Helper</h5>
                          <p className="text-gray-300 text-sm">Color-coded world/object-space axes for orientation</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">X-Ray Mode</h5>
                          <p className="text-gray-300 text-sm">Semi-transparent rendering to reveal hidden elements</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Advanced Lighting</h5>
                          <p className="text-gray-300 text-sm">Real-time shadows and environment lighting</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Advanced Capabilities</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Import/Export Support</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">OBJ Mesh Import</h5>
                          <p className="text-gray-300 text-sm">Import with material support</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">JSON Scene Serialization</h5>
                          <p className="text-gray-300 text-sm">For version control</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">MythicMobs Effect Export</h5>
                          <p className="text-gray-300 text-sm">With coordinate conversion</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">UI Customization</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Dockable Panels</h5>
                          <p className="text-gray-300 text-sm">Customizable layouts</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Keyboard Shortcuts</h5>
                          <p className="text-gray-300 text-sm">Comprehensive shortcuts</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">Multi-Monitor Support</h5>
                          <p className="text-gray-300 text-sm">Extended workspace</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Professional Precision</h4>
                      <p className="text-gray-300 text-sm">Industry-standard tools and controls</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Cross-Platform Performance</h4>
                      <p className="text-gray-300 text-sm">Optimized for various hardware configurations</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Streamlined Workflow</h4>
                      <p className="text-gray-300 text-sm">Seamless integration with MythicMobs and other tools</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Adaptable Interface</h4>
                      <p className="text-gray-300 text-sm">Suitable for both beginners and advanced users</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}


          {/* Tutorials Section */}
          {activeSection === 'video-tutorials' && (
            <motion.section 
              id="video-tutorials"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-16"
            >
            <div className="flex items-center gap-3 mb-6">
              <Video className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Video Tutorials</h2>
            </div>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Learn AuraFX through comprehensive video tutorials and step-by-step guides. Perfect for beginners and advanced users.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Video Tutorials</h3>
                <p className="text-gray-300 mb-6">
                  Master AuraFX with our comprehensive video tutorial series. From basic operations to advanced 3D editing, these step-by-step guides will help you create stunning effects efficiently.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tutorialVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="relative bg-white/5 rounded-lg p-3 overflow-hidden h-full transition-all duration-300 hover:bg-white/10">
                      {/* Video Thumbnail */}
                      <div className="relative mb-2 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-black flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-1 right-1">
                          <span className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
                            {video.duration}
                          </span>
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="space-y-1.5">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold text-white group-hover:text-gray-300 transition-colors leading-tight">
                            {video.title}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${
                            video.level === 'Beginner' 
                              ? 'bg-green-500/20 text-white' 
                              : 'bg-orange-500/20 text-white'
                          }`}>
                            {video.level}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                          {video.description}
                        </p>
                        
                        {/* Watch Button */}
                        <button
                          className="w-full font-medium py-1.5 px-2 rounded-lg transition-all duration-300 bg-white/10 hover:bg-white/20 text-white text-xs"
                          onClick={() => setSelectedVideo(video)}
                        >
                          Watch
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            </motion.section>
          )}
        </main>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedVideo.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedVideo.description}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedVideo(null)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
              
              {/* Video Container */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WikiNewPage;
