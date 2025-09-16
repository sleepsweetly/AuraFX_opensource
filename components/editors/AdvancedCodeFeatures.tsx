"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  BarChart3, 
  Search, 
  Replace, 
  List, 
  Hash, 
  TrendingUp,
  Filter,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface WordFrequency {
  word: string
  count: number
  percentage: number
}

interface CodeStats {
  totalLines: number
  totalWords: number
  totalCharacters: number
  emptyLines: number
  commentLines: number
  codeLines: number
  averageLineLength: number
  longestLine: number
}

interface AdvancedCodeFeaturesProps {
  code: string
  onCodeChange: (code: string) => void
  onFindReplace: (searchText: string, replaceText: string, replaceAll?: boolean) => void
  language: string
}

export function AdvancedCodeFeatures({
  code,
  onCodeChange,
  onFindReplace,
  language
}: AdvancedCodeFeaturesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [minWordLength, setMinWordLength] = useState(3)
  const [showOnlyAlphabetic, setShowOnlyAlphabetic] = useState(true)
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [bulkReplaceText, setBulkReplaceText] = useState("")

  // Analyze word frequency
  const wordFrequency = useMemo(() => {
    if (!code.trim()) return []

    // Extract words based on language
    let words: string[] = []
    
    if (language === 'yaml') {
      // For YAML, extract meaningful words (keys, values, etc.)
      const lines = code.split('\n')
      lines.forEach(line => {
        // Remove comments
        const cleanLine = line.replace(/#.*$/, '').trim()
        if (cleanLine) {
          // Extract YAML keys and values
          const yamlWords = cleanLine.match(/[a-zA-Z_][a-zA-Z0-9_-]*/g) || []
          words.push(...yamlWords)
        }
      })
    } else {
      // For other languages, extract all words
      words = code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []
    }

    // Filter words
    const filteredWords = words.filter(word => {
      if (word.length < minWordLength) return false
      if (showOnlyAlphabetic && !/^[a-zA-Z_][a-zA-Z_]*$/.test(word)) return false
      return true
    })

    // Count frequency
    const frequency: Record<string, number> = {}
    filteredWords.forEach(word => {
      const lowerWord = word.toLowerCase()
      frequency[lowerWord] = (frequency[lowerWord] || 0) + 1
    })

    // Convert to array and sort
    const totalWords = filteredWords.length
    const result: WordFrequency[] = Object.entries(frequency)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Top 50 words

    return result
  }, [code, minWordLength, showOnlyAlphabetic, language])

  // Calculate code statistics
  const codeStats = useMemo((): CodeStats => {
    if (!code.trim()) {
      return {
        totalLines: 0,
        totalWords: 0,
        totalCharacters: 0,
        emptyLines: 0,
        commentLines: 0,
        codeLines: 0,
        averageLineLength: 0,
        longestLine: 0
      }
    }

    const lines = code.split('\n')
    const totalLines = lines.length
    const totalCharacters = code.length
    
    let emptyLines = 0
    let commentLines = 0
    let codeLines = 0
    let longestLine = 0
    let totalLineLength = 0

    lines.forEach(line => {
      const trimmedLine = line.trim()
      totalLineLength += line.length
      longestLine = Math.max(longestLine, line.length)

      if (trimmedLine === '') {
        emptyLines++
      } else if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        commentLines++
      } else {
        codeLines++
      }
    })

    const words = code.match(/\S+/g) || []
    const totalWords = words.length
    const averageLineLength = totalLines > 0 ? totalLineLength / totalLines : 0

    return {
      totalLines,
      totalWords,
      totalCharacters,
      emptyLines,
      commentLines,
      codeLines,
      averageLineLength: Math.round(averageLineLength * 100) / 100,
      longestLine
    }
  }, [code])

  const handleWordSelect = (word: string, checked: boolean) => {
    const newSelected = new Set(selectedWords)
    if (checked) {
      newSelected.add(word)
    } else {
      newSelected.delete(word)
    }
    setSelectedWords(newSelected)
  }

  const handleBulkReplace = () => {
    if (selectedWords.size === 0 || !bulkReplaceText.trim()) return

    let newCode = code
    selectedWords.forEach(word => {
      // Use word boundaries for more precise replacement
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      newCode = newCode.replace(regex, bulkReplaceText)
    })
    
    onCodeChange(newCode)
    setSelectedWords(new Set())
    setBulkReplaceText("")
  }

  const handleSelectAll = () => {
    const allWords = new Set(wordFrequency.map(wf => wf.word))
    setSelectedWords(allWords)
  }

  const handleDeselectAll = () => {
    setSelectedWords(new Set())
  }

  const exportWordList = () => {
    const csvContent = "Word,Count,Percentage\n" + 
      wordFrequency.map(wf => `${wf.word},${wf.count},${wf.percentage.toFixed(2)}%`).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-frequency.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full h-full bg-[#000000] text-white">
      <Tabs defaultValue="frequency" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="frequency" className="data-[state=active]:bg-white/10">
            <BarChart3 className="w-4 h-4 mr-2" />
            Word Analysis
          </TabsTrigger>
          <TabsTrigger value="replace" className="data-[state=active]:bg-white/10">
            <Replace className="w-4 h-4 mr-2" />
            Bulk Replace
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-white/10">
            <Hash className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="frequency" className="h-full overflow-hidden m-0 p-4">
            <div className="h-full flex flex-col gap-4">
              {/* Filters */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="minLength" className="text-xs text-white/80">Min Length:</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={minWordLength}
                        onChange={(e) => setMinWordLength(parseInt(e.target.value) || 1)}
                        className="w-16 h-8 bg-white/10 border-white/20 text-white text-xs"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alphabetic"
                        checked={showOnlyAlphabetic}
                        onCheckedChange={(checked) => setShowOnlyAlphabetic(checked as boolean)}
                        className="border-white/20"
                      />
                      <Label htmlFor="alphabetic" className="text-xs text-white/80">
                        Alphabetic only
                      </Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={exportWordList}
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Word List */}
              <Card className="bg-white/5 border-white/10 flex-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Most Frequent Words ({wordFrequency.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSelectAll}
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Select All
                      </Button>
                      <Button
                        onClick={handleDeselectAll}
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 text-xs"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        Deselect All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {wordFrequency.map((wf, index) => (
                      <div
                        key={wf.word}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedWords.has(wf.word)}
                            onCheckedChange={(checked) => handleWordSelect(wf.word, checked as boolean)}
                            className="border-white/20"
                          />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white/80">
                              #{index + 1}
                            </Badge>
                            <span className="font-mono text-sm text-white">{wf.word}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">{wf.count}</div>
                            <div className="text-xs text-white/60">{wf.percentage.toFixed(1)}%</div>
                          </div>
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.min(wf.percentage * 2, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="replace" className="h-full overflow-hidden m-0 p-4">
            <div className="h-full flex flex-col gap-4">
              {/* Single Replace */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Find & Replace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="search" className="text-xs text-white/80">Find:</Label>
                      <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search text..."
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="replace" className="text-xs text-white/80">Replace with:</Label>
                      <Input
                        id="replace"
                        value={replaceTerm}
                        onChange={(e) => setReplaceTerm(e.target.value)}
                        placeholder="Replacement text..."
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onFindReplace(searchTerm, replaceTerm, false)}
                      disabled={!searchTerm}
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      Replace Next
                    </Button>
                    <Button
                      onClick={() => onFindReplace(searchTerm, replaceTerm, true)}
                      disabled={!searchTerm}
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
                    >
                      Replace All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Replace */}
              <Card className="bg-white/5 border-white/10 flex-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Bulk Replace Selected Words
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="bulkReplace" className="text-xs text-white/80">
                      Replace {selectedWords.size} selected word{selectedWords.size !== 1 ? 's' : ''} with:
                    </Label>
                    <Input
                      id="bulkReplace"
                      value={bulkReplaceText}
                      onChange={(e) => setBulkReplaceText(e.target.value)}
                      placeholder="New text for all selected words..."
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                  
                  {selectedWords.size > 0 && (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-xs text-white/80 mb-2">Selected words:</div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(selectedWords).map(word => (
                          <Badge key={word} variant="outline" className="text-xs bg-blue-500/20 border-blue-500/30 text-blue-200">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBulkReplace}
                    disabled={selectedWords.size === 0 || !bulkReplaceText.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replace {selectedWords.size} Word{selectedWords.size !== 1 ? 's' : ''}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="h-full overflow-hidden m-0 p-4">
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Basic Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Total Lines:</span>
                      <span className="text-white font-semibold">{codeStats.totalLines.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Total Words:</span>
                      <span className="text-white font-semibold">{codeStats.totalWords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Total Characters:</span>
                      <span className="text-white font-semibold">{codeStats.totalCharacters.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Unique Words:</span>
                      <span className="text-white font-semibold">{wordFrequency.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Line Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Code Lines:</span>
                      <span className="text-white font-semibold">{codeStats.codeLines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Comment Lines:</span>
                      <span className="text-white font-semibold">{codeStats.commentLines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Empty Lines:</span>
                      <span className="text-white font-semibold">{codeStats.emptyLines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Avg Line Length:</span>
                      <span className="text-white font-semibold">{codeStats.averageLineLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80 text-sm">Longest Line:</span>
                      <span className="text-white font-semibold">{codeStats.longestLine}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}