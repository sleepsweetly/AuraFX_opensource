"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    Code2,
    Download,
    Terminal,
    Activity,
    FileText,
    Globe,
    Zap,
    Eye,
    EyeOff,
    Copy,
    RefreshCw,
    Play,
    Pause,
    Square,
    Maximize2,
    Minimize2,
    ChevronDown,
    ChevronRight,
    Layers,
    Target,
    Clock,
    Sparkles
} from "lucide-react"
import { MonacoEditor, type MonacoEditorRef } from "@/components/editors/MonacoEditor"
import { useMythicScribeData } from "@/hooks/use-mythicscribe-data"

interface CodeEditPanelProps {
    code: string
    onCodeChange: (code: string) => void
    language?: 'yaml' | 'mythicscript'
    onLanguageChange?: (language: 'yaml' | 'mythicscript') => void
    isVisible: boolean
    onSave?: () => void
}


interface CodeWord {
    word: string
    line: number
    column: number
    type: 'keyword' | 'string' | 'number' | 'comment' | 'mechanic' | 'condition' | 'targeter' | 'attribute'
    context: string
}

export function CodeEditPanel({
    code,
    onCodeChange,
    language = 'mythicscript',
    onLanguageChange,
    isVisible,
    onSave,
}: CodeEditPanelProps) {
    
    // ===== STATE =====
    const [editorCode, setEditorCode] = useState(code)
    const [isDirty, setIsDirty] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 })
    const [showGoToModal, setShowGoToModal] = useState(false)
    const [goToValue, setGoToValue] = useState("")
    const [showLayerList, setShowLayerList] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [codeWords, setCodeWords] = useState<CodeWord[]>([])
    const [selectedWord, setSelectedWord] = useState<string | null>(null)
    const [showWords, setShowWords] = useState(true)
    const [wordSearch, setWordSearch] = useState("")
    
    // ===== REFS =====
    const editorRef = useRef<MonacoEditorRef>(null)
    const goToInputRef = useRef<HTMLInputElement>(null)
    
    // ===== MYTHICSCRIBE DATA =====
    const { data: mythicData, loading: mythicLoading, error: mythicError } = useMythicScribeData()

    // ===== COMPUTED VALUES =====

    // ===== EFFECTS =====

    // Sync with parent code changes
    useEffect(() => {
        if (code !== editorCode) {
            setEditorCode(code)
            setIsDirty(false)
        }
    }, [code])

    // Parse words for navigation
    useEffect(() => {
        const lines = editorCode.split('\n')
        const words: CodeWord[] = []
        
        lines.forEach((line, index) => {
            // Parse words in this line
            const wordMatches = line.match(/\b[A-Za-z0-9_]+\b/g)
            if (wordMatches) {
                wordMatches.forEach((word, wordIndex) => {
                    const column = line.indexOf(word, wordIndex > 0 ? line.indexOf(wordMatches[wordIndex - 1]) + wordMatches[wordIndex - 1].length : 0) + 1
                    
                    let type: CodeWord['type'] = 'keyword'
                    let context = line.trim()
                    
                    // Determine word type
                    if (word.startsWith('#')) {
                        type = 'comment'
                    } else if (word.match(/^\d+$/)) {
                        type = 'number'
                    } else if (word.match(/^"[^"]*"$/) || word.match(/^'[^']*'$/)) {
                        type = 'string'
                    } else if (line.includes('-') && line.indexOf(word) > line.indexOf('-')) {
                        type = 'mechanic'
                    } else if (line.includes('@')) {
                        type = 'targeter'
                    } else if (line.includes('{') && line.includes('}')) {
                        type = 'attribute'
                    }
                    
                    words.push({
                        word,
                        line: index + 1,
                        column,
                        type,
                        context
                    })
                })
            }
        })
        
        setCodeWords(words)
    }, [editorCode])

    // Keyboard shortcuts
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault()
                        onSave?.()
                        break
                    case 'g':
                        e.preventDefault()
                        setShowGoToModal(true)
                        break
                    case 'f':
                        e.preventDefault()
                        // Find functionality
                        break
                    case 'Enter':
                e.preventDefault()
                        onSave?.()
                        break
            }
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onSave])

    // ===== HANDLERS =====
    
    const handleCodeChange = (newCode: string) => {
        setEditorCode(newCode)
        setIsDirty(newCode !== code)
        onCodeChange(newCode)
    }

    const handleGoToLine = () => {
        const lineNumber = parseInt(goToValue)
        if (lineNumber > 0) {
            editorRef.current?.setPosition(lineNumber, 1)
            setShowGoToModal(false)
            setGoToValue("")
        }
    }


    const handleWordClick = (word: CodeWord) => {
        const editor = editorRef.current?.getEditor()
        if (editor) {
            const model = editor.getModel()
            if (model) {
                // Find all occurrences of the word
                const wordText = word.word
                const matches = model.findMatches(wordText, false, false, true, null, false)
                
                if (matches.length > 0) {
                    // Select all occurrences
                    const selections = matches.map(match => ({
                        selectionStartLineNumber: match.range.startLineNumber,
                        selectionStartColumn: match.range.startColumn,
                        positionLineNumber: match.range.endLineNumber,
                        positionColumn: match.range.endColumn
                    }))
                    
                    // Set multiple selections (like Ctrl+D multiple times)
                    editor.setSelections(selections)
                    
                    // Focus the editor to show cursor
                    editor.focus()
                    
                    // Reveal the first match
                    editor.revealRange(matches[0].range)
                    
                    // Trigger a small delay to ensure cursor is visible
                    setTimeout(() => {
                        editor.focus()
                    }, 10)
                }
            }
        }
        
        setSelectedWord(word.word)
    }



    const handleCopyCode = () => {
        navigator.clipboard.writeText(editorCode)
    }


    // ===== MYTHICSCRIPT PROVIDERS =====
    useEffect(() => {
        const monaco = editorRef.current?.getMonaco()
        const editor = editorRef.current?.getEditor()
        if (!monaco || !editor || language !== 'mythicscript' || !mythicData) return

        // Auto-completion provider
        const completionProvider = monaco.languages.registerCompletionItemProvider('mythicscript', {
            triggerCharacters: ['-', ' ', '{', ':', '@'],
            provideCompletionItems: (model, position, context) => {
                    const lineNumber = position.lineNumber
                    const line = model.getLineContent(lineNumber)
                    const before = line.substring(0, Math.max(0, position.column - 1))
                    const wordMatch = before.match(/[A-Za-z0-9_]+$/)
                    const token = (wordMatch?.[0] || '').toLowerCase()

                const suggestions: any[] = []

                // If triggered by typing and token is too short, don't show suggestions
                if (context.triggerKind === monaco.languages.CompletionTriggerKind.Invoke && token.length < 2) {
                    return { suggestions: [] }
                }

                // Check if we're in a mechanic/condition context
                const dash = line.match(/^\s*-\s*([^\s{#]*)/)
                    if (dash) {
                        const head = (dash[1] || '').toLowerCase()
                    
                    // Add mechanics
                    for (const [key, mechanic] of mythicData.byKind.mechanic) {
                        if (key.startsWith(token)) {
                            suggestions.push({
                                label: {
                                    label: mechanic.label,
                                    description: 'Mechanic'
                                },
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: mechanic.label,
                                detail: mechanic.description || 'Mechanic',
                                documentation: mechanic.description,
                                sortText: `0${mechanic.label}`,
                                range: new monaco.Range(lineNumber, position.column - token.length, lineNumber, position.column)
                            })
                        }
                    }
                    
                    // Add conditions
                    for (const [key, condition] of mythicData.byKind.condition) {
                        if (key.startsWith(token)) {
                            suggestions.push({
                                label: {
                                    label: condition.label,
                                    description: 'Condition'
                                },
                                kind: monaco.languages.CompletionItemKind.Keyword,
                                insertText: condition.label,
                                detail: condition.description || 'Condition',
                                documentation: condition.description,
                                sortText: `1${condition.label}`,
                                range: new monaco.Range(lineNumber, position.column - token.length, lineNumber, position.column)
                            })
                        }
                    }
                } else {
                    // If no dash, still provide suggestions for common mechanics
                    for (const [key, mechanic] of mythicData.byKind.mechanic) {
                        if (key.startsWith(token)) {
                            suggestions.push({
                                label: {
                                    label: mechanic.label,
                                    description: 'Mechanic'
                                },
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: `- ${mechanic.label}`,
                                detail: mechanic.description || 'Mechanic',
                                documentation: mechanic.description,
                                sortText: `0${mechanic.label}`,
                                range: new monaco.Range(lineNumber, position.column - token.length, lineNumber, position.column)
                            })
                        }
                    }
                }

                // Check if we're in an attribute context
                    const braceStart = line.lastIndexOf('{', position.column - 1)
                    const braceEnd = line.indexOf('}', position.column - 1)
                    if (braceStart !== -1 && (braceEnd === -1 || braceEnd > position.column - 1)) {
                        const headMatch = line.match(/^\s*-\s*([^\s{#]+)/)
                        const head = (headMatch?.[1] || '').toLowerCase()
                    if (head && mythicData.attributesByMechanic.has(head)) {
                        const attrs = mythicData.attributesByMechanic.get(head)!
                        for (const attr of attrs) {
                            if (attr.startsWith(token)) {
                                suggestions.push({
                                    label: attr,
                                    kind: monaco.languages.CompletionItemKind.Property,
                                    insertText: attr,
                                    detail: `Attribute of ${head}`,
                                    sortText: attr,
                                    range: new monaco.Range(lineNumber, position.column - token.length, lineNumber, position.column)
                                })
                            }
                        }
                    }
                }

                return { suggestions }
            }
        })

        // Hover provider
        const hoverProvider = monaco.languages.registerHoverProvider('mythicscript', {
            provideHover: (model, position) => {
                    const lineNumber = position.lineNumber
                    const line = model.getLineContent(lineNumber)
                    const before = line.substring(0, Math.max(0, position.column - 1))
                    const wordMatch = before.match(/[A-Za-z0-9_]+$/)
                    const token = (wordMatch?.[0] || '').toLowerCase()

                if (!token) return { contents: [] as any[] }

                // Check for mechanic/condition
                    const dash = line.match(/^\s*-\s*([^\s{#]+)/)
                    if (dash) {
                        const head = (dash[1] || '').toLowerCase()
                    if (token === head) {
                        const mechanic = mythicData.byKind.mechanic.get(head)
                        const condition = mythicData.byKind.condition.get(head)
                        const item = mechanic || condition
                        
                        if (item) {
                            const attrs = mythicData.attributesByMechanic.get(head)
                            let md = `**${item.label}**  `
                            if (item.description) md += `\n${item.description}  `
                            if (attrs && attrs.size > 0) md += `\nAttributes: ${Array.from(attrs).join(', ')}`
                            
                            return {
                                contents: [{ value: md }]
                            }
                        }
                    }
                }

                return { contents: [] as any[] }
            }
        })

        return () => {
            completionProvider.dispose()
            hoverProvider.dispose()
        }
    }, [language, mythicData])

    if (!isVisible) return null

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-sm">Code Editor</span>
                    {isDirty && <div className="w-2 h-2 bg-orange-400 rounded-full" />}
            </div>

                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-white/60" />
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange?.(e.target.value as 'yaml' | 'mythicscript')}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="yaml" className="bg-black text-white">YAML</option>
                            <option value="mythicscript" className="bg-black text-white">MythicScript</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">

                    <Button
                            onClick={handleCopyCode}
                        size="sm"
                        variant="ghost"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            title="Copy Code"
                    >
                            <Copy className="w-3 h-3" />
                    </Button>

                    <Button
                            onClick={() => setShowGoToModal(true)}
                        size="sm"
                        variant="ghost"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        title="Go to Line (Ctrl+G)"
                    >
                            <Target className="w-3 h-3" />
                    </Button>

                    </div>
                </div>
            </div>

            {/* ===== STATS BAR ===== */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">Code Editor</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {mythicLoading && (
                        <div className="flex items-center gap-1 text-blue-400">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Loading MythicScript...</span>
                        </div>
                    )}
                    {mythicError && (
                        <div className="flex items-center gap-1 text-red-400">
                            <span>MythicScript Error</span>
                        </div>
                    )}
                    {mythicData && !mythicLoading && (
                        <div className="flex items-center gap-1 text-green-400">
                            <span>MythicScript Ready</span>
                        </div>
                    )}
                </div>
            </div>


            {/* ===== MAIN CONTENT ===== */}
            <div className="flex flex-1 min-h-0">
                {/* ===== SIDEBAR ===== */}
                <div className="w-64 bg-white/5 border-r border-white/10 flex flex-col">
                    {/* Code Words */}
                    <div className="p-3 border-b border-white/10 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold text-white/80">Code Words</h3>
                            <button
                                onClick={() => setShowWords(!showWords)}
                                className="text-xs text-white/60 hover:text-white"
                            >
                                {showWords ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {showWords && (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-white/40">
                                        {codeWords.filter((word, index, self) => 
                                            self.findIndex(w => w.word === word.word) === index &&
                                            word.word.length > 2 &&
                                            ![
                                                // AuraFX branding and marketing words
                                                'aurafx', 'generated', 'created', 'made', 'powered', 'free', 'registration', 'required', 'join', 'discord', 'community', 'share', 'creation', 'friends', 'advanced', 'analytics', 'admin', 'panel',
                                                'created', 'with', 'online', 'particle', 'effect', 'generator', 'create', 'your', 'own', 'effects', 'join', 'our', 'discord', 'no', 'registration', 'required', 'free', 'share', 'your', 'creation', 'with', 'friends', 'create', 'more', 'effects', 'join', 'our', 'community',
                                                
                                                // URL and web related
                                                'https', 'http', 'www', 'com', 'online', 'discord', 'gg', 'invite', 'url', 'link', 'website', 'site', 'web',
                                                
                                                // Technical metadata and comments
                                                'total', 'elements', 'lines', 'active', 'modes', 'action', 'recording', 'chain', 'gif', 'animation', 'frame', 'group', 'element', 'complete', 'loop', 'base', 'canvas', 'skipped', 'shown', 'recorded', 'perform', 'actions', 'animation',
                                                'generated', 'at', 'elements', 'active', 'modes', 'action', 'recording', 'recorded', 'actions', 'chain', 'mode', 'groups', 'action', 'recording', 'mode', 'base', 'canvas', 'elements', 'skipped', 'only', 'actions', 'shown', 'action', 'recording', 'animation', 'frames', 'frame', 'delay', 'gif', 'animation', 'frames', 'powered', 'by', 'aurafx', 'online', 'loop', 'animation', 'chain', 'effect', 'complete', 'powered', 'by', 'aurafx', 'online', 'create', 'more', 'chains', 'layer', 'made', 'with', 'aurafx', 'online', 'effect', 'complete', 'share', 'your', 'creation', 'with', 'friends', 'create', 'more', 'effects', 'join', 'our', 'community',
                                                
                                                // Common English words
                                                'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'why',
                                                
                                                // Coordinate and position words
                                                'xoffset', 'zoffset', 'yoffset', 'x', 'y', 'z', 'offset', 'position', 'pos', 'coord', 'coordinate', 'location', 'loc'
                                            ].includes(word.word.toLowerCase()) &&
                                            (wordSearch === "" || word.word.toLowerCase().includes(wordSearch.toLowerCase()))
                                        ).length} words
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search words..."
                                    value={wordSearch}
                                    onChange={(e) => setWordSearch(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50 mb-2"
                                />
                                <div className="space-y-1 max-h-80 overflow-y-auto">
                                {codeWords
                                    .filter((word, index, self) => 
                                        // Remove duplicates and filter out common words
                                        self.findIndex(w => w.word === word.word) === index &&
                                        word.word.length > 2 &&
                                        // Filter out pure numbers, coordinates, and timestamps
                                        !/^-?\d+\.?\d*$/.test(word.word) &&
                                        // Filter out timestamps and dates
                                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(word.word) &&
                                        !/^\d{4}-\d{2}-\d{2}/.test(word.word) &&
                                        !/^\d{2}:\d{2}:\d{2}/.test(word.word) &&
                                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(word.word) &&
                                        // Filter out URLs and hashes
                                        !/^https?:\/\//.test(word.word) &&
                                        !/^[a-zA-Z0-9]{8,}$/.test(word.word) &&
                                        ![
                                            // AuraFX branding and marketing words
                                            'aurafx', 'generated', 'created', 'made', 'powered', 'free', 'registration', 'required', 'join', 'discord', 'community', 'share', 'creation', 'friends', 'advanced', 'analytics', 'admin', 'panel',
                                            'created', 'with', 'online', 'particle', 'effect', 'generator', 'create', 'your', 'own', 'effects', 'join', 'our', 'discord', 'no', 'registration', 'required', 'free', 'share', 'your', 'creation', 'with', 'friends', 'create', 'more', 'effects', 'join', 'our', 'community',
                                            
                                            // URL and web related
                                            'https', 'http', 'www', 'com', 'online', 'discord', 'gg', 'invite', 'url', 'link', 'website', 'site', 'web',
                                            
                                            // Technical metadata and comments
                                            'total', 'elements', 'lines', 'active', 'modes', 'action', 'recording', 'chain', 'gif', 'animation', 'frame', 'group', 'element', 'complete', 'loop', 'base', 'canvas', 'skipped', 'shown', 'recorded', 'perform', 'actions', 'animation',
                                            'generated', 'at', 'elements', 'active', 'modes', 'action', 'recording', 'recorded', 'actions', 'chain', 'mode', 'groups', 'action', 'recording', 'mode', 'base', 'canvas', 'elements', 'skipped', 'only', 'actions', 'shown', 'action', 'recording', 'animation', 'frames', 'frame', 'delay', 'gif', 'animation', 'frames', 'powered', 'by', 'aurafx', 'online', 'loop', 'animation', 'chain', 'effect', 'complete', 'powered', 'by', 'aurafx', 'online', 'create', 'more', 'chains', 'layer', 'made', 'with', 'aurafx', 'online', 'effect', 'complete', 'share', 'your', 'creation', 'with', 'friends', 'create', 'more', 'effects', 'join', 'our', 'community',
                                            
                                            // Common English words
                                            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'why',
                                            
                                            // Coordinate and position words
                                            'xoffset', 'zoffset', 'yoffset', 'x', 'y', 'z', 'offset', 'position', 'pos', 'coord', 'coordinate', 'location', 'loc'
                                        ].includes(word.word.toLowerCase()) &&
                                        (wordSearch === "" || word.word.toLowerCase().includes(wordSearch.toLowerCase()))
                                    )
                                    .sort((a, b) => {
                                        // Sort by type first, then alphabetically
                                        if (a.type !== b.type) {
                                            const typeOrder = ['mechanic', 'condition', 'targeter', 'attribute', 'keyword', 'string', 'number', 'comment']
                                            return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
                                        }
                                        return a.word.localeCompare(b.word)
                                    })
                                    .map((word, index) => (
                                        <button
                                            key={`${word.word}-${word.line}-${index}`}
                                            onClick={() => handleWordClick(word)}
                                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-white/10 ${
                                                selectedWord === word.word ? 'bg-white/10 text-white' : 'text-white/60'
                                            }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${
                                                word.type === 'mechanic' ? 'bg-blue-400' :
                                                word.type === 'condition' ? 'bg-purple-400' :
                                                word.type === 'targeter' ? 'bg-green-400' :
                                                word.type === 'attribute' ? 'bg-yellow-400' :
                                                word.type === 'comment' ? 'bg-gray-400' :
                                                word.type === 'string' ? 'bg-orange-400' :
                                                word.type === 'number' ? 'bg-red-400' :
                                                'bg-white/40'
                                            }`} />
                                            <span className="truncate">{word.word}</span>
                                            <span className="text-xs text-white/40 ml-auto">L{word.line}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                </div>

            </div>

                {/* ===== EDITOR ===== */}
                <div className="flex-1 relative min-h-0">
                    <MonacoEditor
                        ref={editorRef}
                        value={editorCode}
                        onChange={handleCodeChange}
                        language={language}
                        height="100%"
                        onCursorPositionChange={setCursorPosition}
                    />
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-t border-white/10 text-xs">
                <div className="flex items-center gap-4">
                    <span className="text-white/60">
                        Line {cursorPosition.lineNumber}, Column {cursorPosition.column}
                    </span>
                    <span className="text-white/60">
                        {editorCode.split('\n').length} lines
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-white/60">Language:</span>
                    <span className="text-white font-medium">{language}</span>
                            </div>
                        </div>

            {/* ===== GO TO MODAL ===== */}
                    {showGoToModal && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-black border border-white/20 rounded-lg p-4 w-80">
                        <h3 className="text-white font-semibold mb-3">Go to Line</h3>
                                <input
                                    ref={goToInputRef}
                                    type="number"
                                    value={goToValue}
                                    onChange={(e) => setGoToValue(e.target.value)}
                            placeholder="Enter line number"
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            autoFocus
                        />
                        <div className="flex gap-2 mt-3">
                            <Button
                                onClick={handleGoToLine}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                            >
                                Go
                            </Button>
                            <Button
                                        onClick={() => setShowGoToModal(false)}
                                size="sm"
                                variant="ghost"
                                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs"
                                    >
                                        Cancel
                            </Button>
                        </div>
                    </div>
                        </div>
                    )}
        </div>
    )
}