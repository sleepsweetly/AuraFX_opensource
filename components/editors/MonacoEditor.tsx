"use client"

import React, { useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"

// Load MythicScript language support
async function loadMythicScriptLanguage(monaco: typeof import("monaco-editor")) {
  try {
    // Register MythicScript language
    monaco.languages.register({ id: 'mythicscript' })
    
    // Set language configuration inline (safer than fetching)
    const languageConfig = {
      comments: {
        lineComment: "#"
      },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
      ] as [string, string][],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "\"", close: "\"" },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: "\"", close: "\"" },
        { open: "'", close: "'" },
        { open: "<", close: ">" },
        { open: "(", close: ")" }
      ]
    }
    
    // Set language configuration
    monaco.languages.setLanguageConfiguration('mythicscript', languageConfig)
    
    // Set syntax highlighting with custom grammar
    monaco.languages.setMonarchTokensProvider('mythicscript', {
      tokenizer: {
        root: [
          // Comments
          [/#.*$/, 'comment'],
          
          // Strings
          [/"(?:[^"\\]|\\.)*"/, 'string'],
          [/'[^']*'/, 'string'],
          
          // Numbers
          [/\d+/, 'number'],
          
          // Mechanics and conditions (lines starting with -)
          [/^\s*-\s*([a-zA-Z_][a-zA-Z0-9_]*)/, 'mechanic'],
          
          // Attributes (inside braces)
          [/\{[^}]*\}/, 'attribute'],
          
          // Targeters (starting with @)
          [/@[a-zA-Z_][a-zA-Z0-9_]*/, 'targeter'],
          
          // Keywords
          [/\b(if|then|else|endif|while|endwhile|for|endfor|switch|case|default|endswitch)\b/, 'keyword'],
          
          // Operators
          [/[{}()[\]]/, 'delimiter'],
          [/[=<>!&|+\-*/%]/, 'operator'],
          
          // Whitespace
          [/\s+/, 'white'],
          
          // Other identifiers
          [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier']
        ]
      }
    })
    
    console.log('MythicScript language support loaded successfully')
  } catch (error) {
    console.error('Failed to load MythicScript language support:', error)
    // Fallback: register basic language without configuration
    try {
      monaco.languages.register({ id: 'mythicscript' })
      console.log('MythicScript language registered with basic configuration')
    } catch (fallbackError) {
      console.error('Failed to register MythicScript language:', fallbackError)
    }
  }
}

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-white/5 border border-white/10 rounded-lg">
      <div className="text-white/60 text-sm">Loading editor...</div>
    </div>
  ),
})

export interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'javascript' | 'typescript' | 'yaml' | 'mythicscript'
  height?: string | number
  width?: string | number
  theme?: string
  options?: editor.IStandaloneEditorConstructionOptions
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => void
  onCursorPositionChange?: (position: { lineNumber: number; column: number }) => void
  className?: string
}

export interface MonacoEditorRef {
  getEditor: () => editor.IStandaloneCodeEditor | null
  getMonaco: () => typeof import("monaco-editor") | null
  focus: () => void
  getPosition: () => { lineNumber: number; column: number } | null
  setPosition: (lineNumber: number, column: number) => void
  getSelection: () => string
  insertText: (text: string) => void
  formatDocument: () => void
  findAndReplace: (searchText: string, replaceText: string, replaceAll?: boolean) => void
  highlightSearch: (searchText: string) => number
  clearHighlights: () => void
  findNext: () => void
  findPrevious: () => void
  getCaretClientPosition: () => { top: number; left: number } | null
  setModelMarkers: (owner: string, markers: any[]) => void
}

export const MonacoEditor = React.forwardRef<MonacoEditorRef, MonacoEditorProps>(
  ({
    value,
    onChange,
    language,
    height = "100%",
    width = "100%",
    theme = "custom-dark",
    options = {},
    onMount,
    onCursorPositionChange,
    className = "",
  }, ref) => {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null)
    const decorationsRef = useRef<string[]>([])
    const currentSearchRef = useRef<string>("")
    const currentMatchIndexRef = useRef<number>(0)
    const matchesRef = useRef<any[]>([])

    const handleEditorDidMount = useCallback(async (editor: editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => {
      editorRef.current = editor
      monacoRef.current = monaco

      // Load MythicScript language support
      await loadMythicScriptLanguage(monaco)

      // Define custom dark theme matching application design
      monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'F97583', fontStyle: 'bold' },
          { token: 'string', foreground: '9ECBFF' },
          { token: 'number', foreground: '79B8FF' },
          { token: 'type', foreground: 'B392F0', fontStyle: 'bold' },
          { token: 'function', foreground: 'FFAB70', fontStyle: 'bold' },
          { token: 'variable', foreground: 'FFFFFF' },
          { token: 'operator', foreground: 'F97583' },
          { token: 'delimiter', foreground: 'E1E4E8' },
          // YAML specific tokens
          { token: 'key', foreground: '79B8FF', fontStyle: 'bold' },
          { token: 'string.yaml', foreground: '9ECBFF' },
          { token: 'number.yaml', foreground: '79B8FF' },
          // MythicScript specific tokens
          { token: 'mechanic', foreground: 'FFAB70', fontStyle: 'bold' },
          { token: 'condition', foreground: 'B392F0', fontStyle: 'bold' },
          { token: 'targeter', foreground: '79B8FF', fontStyle: 'bold' },
          { token: 'attribute', foreground: '9ECBFF' },
          { token: 'mythic.keyword', foreground: 'F97583', fontStyle: 'bold' },
          { token: 'mythic.string', foreground: '9ECBFF' },
          { token: 'mythic.number', foreground: '79B8FF' },
        ],
        colors: {
          'editor.background': '#000000',
          'editor.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#FFFFFF08',
          'editor.selectionBackground': '#FFFFFF20',
          'editor.selectionHighlightBackground': '#FFFFFF10',
          'editorLineNumber.foreground': '#FFFFFF40',
          'editorLineNumber.activeForeground': '#FFFFFF80',
          'editorCursor.foreground': '#FFFFFF',
          'scrollbarSlider.background': '#FFFFFF20',
          'scrollbarSlider.hoverBackground': '#FFFFFF30',
          'scrollbarSlider.activeBackground': '#FFFFFF40',
          'editorWidget.background': '#000000',
          'editorWidget.border': '#FFFFFF20',
          'editorSuggestWidget.background': '#000000',
          'editorSuggestWidget.border': '#FFFFFF20',
          'editorSuggestWidget.foreground': '#FFFFFF',
          'editorSuggestWidget.highlightForeground': '#FFFFFF',
          'editorSuggestWidget.selectedBackground': '#FFFFFF10',
          'editorSuggestWidget.selectedForeground': '#FFFFFF',
          'editorSuggestWidget.focusHighlightForeground': '#79B8FF',
          'editorHoverWidget.background': '#000000',
          'editorHoverWidget.border': '#FFFFFF20',
        }
      })

      // Set the theme
      monaco.editor.setTheme('custom-dark')

      // Add cursor position change listener
      if (onCursorPositionChange) {
        editor.onDidChangeCursorPosition((e) => {
          onCursorPositionChange({
            lineNumber: e.position.lineNumber,
            column: e.position.column
          })
        })
      }

      // Focus the editor
      editor.focus()

      // Call the onMount callback if provided
      if (onMount) {
        onMount(editor, monaco)
      }
    }, [onMount, onCursorPositionChange])

    // Update editor language when language prop changes
    useEffect(() => {
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel()
        if (model) {
          monacoRef.current.editor.setModelLanguage(model, language)
        }
      }
    }, [language])

    const handleChange = useCallback((value: string | undefined) => {
      onChange(value || '')
    }, [onChange])

    // Expose methods through ref
    React.useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      getMonaco: () => monacoRef.current,
      
      focus: () => {
        editorRef.current?.focus()
      },
      
      getPosition: () => {
        const position = editorRef.current?.getPosition()
        return position ? { lineNumber: position.lineNumber, column: position.column } : null
      },
      
      setPosition: (lineNumber: number, column: number) => {
        editorRef.current?.setPosition({ lineNumber, column })
      },
      
      getSelection: () => {
        const selection = editorRef.current?.getSelection()
        return selection ? editorRef.current?.getModel()?.getValueInRange(selection) || '' : ''
      },
      
      insertText: (text: string) => {
        const editor = editorRef.current
        if (editor) {
          const position = editor.getPosition()
          if (position) {
            editor.executeEdits('insert-text', [{
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
              },
              text: text
            }])
          }
        }
      },
      
      formatDocument: () => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run()
      },
      
      findAndReplace: (searchText: string, replaceText: string, replaceAll = false) => {
        const editor = editorRef.current
        const monaco = monacoRef.current
        if (editor && monaco) {
          const model = editor.getModel()
          if (model) {
            const matches = model.findMatches(
              searchText,
              false, // searchOnlyEditableRange
              false, // isRegex
              true,  // matchCase
              null,  // wordSeparators
              false  // captureMatches
            )
            
            if (matches.length > 0) {
              if (replaceAll) {
                editor.executeEdits('replace-all', matches.map(match => ({
                  range: match.range,
                  text: replaceText
                })))
              } else {
                // Replace first match
                editor.executeEdits('replace-first', [{
                  range: matches[0].range,
                  text: replaceText
                }])
              }
            }
          }
        }
      },

      highlightSearch: (searchText: string) => {
        const editor = editorRef.current
        const monaco = monacoRef.current
        if (!editor || !monaco || !searchText) return 0

        // Clear previous highlights
        if (decorationsRef.current.length > 0) {
          editor.deltaDecorations(decorationsRef.current, [])
          decorationsRef.current = []
        }

        const model = editor.getModel()
        if (!model) return 0

        // Find all matches
        const matches = model.findMatches(
          searchText,
          false, // searchOnlyEditableRange
          false, // isRegex
          false, // matchCase (case insensitive for better UX)
          null,  // wordSeparators
          false  // captureMatches
        )

        matchesRef.current = matches
        currentSearchRef.current = searchText
        currentMatchIndexRef.current = 0

        if (matches.length > 0) {
          // Create decorations for all matches
          const decorations = matches.map((match, index) => ({
            range: match.range,
            options: {
              className: index === 0 ? 'current-search-match' : 'search-match',
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              overviewRuler: {
                color: index === 0 ? '#3b82f6' : '#3b82f680',
                position: monaco.editor.OverviewRulerLane.Right
              },
              minimap: {
                color: index === 0 ? '#3b82f6' : '#3b82f680',
                position: monaco.editor.MinimapPosition.Inline
              }
            }
          }))

          // Apply decorations
          decorationsRef.current = editor.deltaDecorations([], decorations)

          // Navigate to first match
          editor.setPosition({
            lineNumber: matches[0].range.startLineNumber,
            column: matches[0].range.startColumn
          })
          editor.revealLineInCenter(matches[0].range.startLineNumber)
        }

        return matches.length
      },

      clearHighlights: () => {
        const editor = editorRef.current
        if (editor && decorationsRef.current.length > 0) {
          editor.deltaDecorations(decorationsRef.current, [])
          decorationsRef.current = []
          matchesRef.current = []
          currentSearchRef.current = ""
          currentMatchIndexRef.current = 0
        }
      },

      findNext: () => {
        const editor = editorRef.current
        const monaco = monacoRef.current
        if (!editor || !monaco || matchesRef.current.length === 0) return

        // Move to next match
        currentMatchIndexRef.current = (currentMatchIndexRef.current + 1) % matchesRef.current.length
        const currentMatch = matchesRef.current[currentMatchIndexRef.current]

        // Update decorations to highlight current match
        const decorations = matchesRef.current.map((match, index) => ({
          range: match.range,
          options: {
            className: index === currentMatchIndexRef.current ? 'current-search-match' : 'search-match',
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            overviewRuler: {
              color: index === currentMatchIndexRef.current ? '#3b82f6' : '#3b82f680',
              position: monaco.editor.OverviewRulerLane.Right
            },
            minimap: {
              color: index === currentMatchIndexRef.current ? '#3b82f6' : '#3b82f680',
              position: monaco.editor.MinimapPosition.Inline
            }
          }
        }))

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations)

        // Navigate to current match
        editor.setPosition({
          lineNumber: currentMatch.range.startLineNumber,
          column: currentMatch.range.startColumn
        })
        editor.revealLineInCenter(currentMatch.range.startLineNumber)
      },

      findPrevious: () => {
        const editor = editorRef.current
        const monaco = monacoRef.current
        if (!editor || !monaco || matchesRef.current.length === 0) return

        // Move to previous match
        currentMatchIndexRef.current = currentMatchIndexRef.current === 0 
          ? matchesRef.current.length - 1 
          : currentMatchIndexRef.current - 1
        const currentMatch = matchesRef.current[currentMatchIndexRef.current]

        // Update decorations to highlight current match
        const decorations = matchesRef.current.map((match, index) => ({
          range: match.range,
          options: {
            className: index === currentMatchIndexRef.current ? 'current-search-match' : 'search-match',
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            overviewRuler: {
              color: index === currentMatchIndexRef.current ? '#3b82f6' : '#3b82f680',
              position: monaco.editor.OverviewRulerLane.Right
            },
            minimap: {
              color: index === currentMatchIndexRef.current ? '#3b82f6' : '#3b82f680',
              position: monaco.editor.MinimapPosition.Inline
            }
          }
        }))

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations)

        // Navigate to current match
        editor.setPosition({
          lineNumber: currentMatch.range.startLineNumber,
          column: currentMatch.range.startColumn
        })
        editor.revealLineInCenter(currentMatch.range.startLineNumber)
      }
      ,
      getCaretClientPosition: () => {
        const editor = editorRef.current
        const monaco = monacoRef.current
        if (!editor || !monaco) return null
        const position = editor.getPosition()
        if (!position) return null
        const svp = (editor as any).getScrolledVisiblePosition?.(position)
        const dom: HTMLElement | null = editor.getDomNode() as any
        if (!svp || !dom) return null
        const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight)
        // Return coordinates RELATIVE to the editor container to allow absolute positioning inside
        const top = svp.top + (lineHeight || svp.height || 18)
        const left = svp.left + 2
        return { top, left }
      },
      setModelMarkers: (owner: string, markers: any[]) => {
        const editor = editorRef.current
        const monaco = monacoRef.current
        if (!editor || !monaco) return
        const model = editor.getModel()
        if (!model) return
        monaco.editor.setModelMarkers(model, owner, markers)
      }
    }), [])

    // Default editor options with responsive sizing
    const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'mouseover',
      tabSize: 2,
      insertSpaces: true,
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      bracketPairColorization: { enabled: true },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      acceptSuggestionOnCommitCharacter: true,
      // Multi-cursor settings
      multiCursorModifier: 'ctrlCmd',
      multiCursorMergeOverlapping: true,
      // Cursor settings for better visibility
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'off',
      cursorStyle: 'line',
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      // Enhanced features for professional editing
      parameterHints: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'languageDefined',
      // Responsive sizing
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    }

    const mergedOptions = { ...defaultOptions, ...options }

    return (
      <div className={`monaco-editor-wrapper h-full ${className}`}>
        <style jsx global>{`
          .search-match {
            background-color: rgba(59, 130, 246, 0.3) !important;
            border: 1px solid rgba(59, 130, 246, 0.5) !important;
            border-radius: 2px !important;
          }
          
          .current-search-match {
            background-color: rgba(59, 130, 246, 0.6) !important;
            border: 1px solid #3b82f6 !important;
            border-radius: 2px !important;
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.8) !important;
          }
          
          .monaco-editor .margin-view-overlays .current-line {
            border: none !important;
          }
          
          /* Classic cursor styling */
          .monaco-editor .cursors-layer .cursor {
            background-color: #ffffff !important;
            border: none !important;
            width: 1px !important;
          }
          
          .monaco-editor .cursors-layer .cursor.secondary {
            background-color: #ffffff !important;
            border: none !important;
            width: 1px !important;
          }
        `}</style>
        <Editor
          height={height}
          width={width}
          language={language}
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={theme}
          options={mergedOptions}
        />
      </div>
    )
  }
)

MonacoEditor.displayName = 'MonacoEditor'