"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Home, Search, Calendar, Link as LinkIcon, ChevronRight } from "lucide-react"

import type { Article, ArticleMeta } from "@/lib/wiki-data"

interface Props {
  article: Article
  categories: { name: string; items: ArticleMeta[] }[]
}

export default function ArticleClient({ article, categories }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ArticleMeta[]>([])
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )
    const els = Object.values(sectionRefs.current)
    els.forEach((el) => el && obs.observe(el))
    return () => els.forEach((el) => el && obs.unobserve(el))
  }, [article.slug])

  useEffect(() => {
    // build simple search index from categories items (titles)
    const items = categories.flatMap((c) => c.items)
    setResults(
      query.trim()
        ? items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
        : items
    )
  }, [query, categories])

  const copyAnchor = (id: string) => {
    const { origin, pathname } = window.location
    navigator.clipboard.writeText(`${origin}${pathname}#${id}`)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-800/60 bg-black/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center gap-3 text-sm text-gray-400">
          <Link href="/wiki" className="flex items-center gap-2 hover:text-white">
            <Home className="h-4 w-4" /> Wiki
          </Link>
          <ChevronRight className="h-4 w-4 opacity-50" />
          <span className="text-gray-300">{article.title}</span>
          <div className="ml-auto flex items-center gap-3">
            {article.version && (
              <Badge variant="secondary" className="border-purple-600/30 bg-purple-900/30 text-purple-300">
                {article.version}
              </Badge>
            )}
            {article.lastUpdated && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3.5 w-3.5" /> {article.lastUpdated}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto grid max-w-screen-xl gap-10 py-10 lg:grid-cols-[240px_1fr_300px]">
        {/* Left TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h4 className="mb-3 text-sm font-semibold text-gray-300">On this page</h4>
            <ul className="space-y-2">
              {article.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block rounded px-2 py-1 text-sm ${active === s.id ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-gray-900/60 hover:text-white'}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Article */}
        <main>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{article.title}</h1>
          <p className="mb-8 text-gray-400">{article.description}</p>
          <Separator className="mb-8 bg-gray-800" />

          <div className="space-y-10">
            {article.sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                ref={(el) => { sectionRefs.current[sec.id] = el }}
                className="scroll-mt-28"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">{sec.title}</h2>
                </div>
                <div className="space-y-3 text-sm leading-7 text-gray-300">
                  {sec.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>

        {/* Right: Global search and related */}
        <aside>
          <div className="sticky top-24 space-y-6">
            <Card className="border-gray-800/60 bg-[#0b0b0b]">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search the wiki"
                    className="w-full rounded-md border border-gray-800 bg-black/70 py-2 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                  {results.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/wiki/${r.slug}`} className="block rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-900/60 hover:text-white">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-800/60 bg-[#0b0b0b]">
              <CardContent className="p-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-300">Categories</h4>
                <div className="space-y-3">
                  {categories.map((c) => (
                    <div key={c.name}>
                      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">{c.name}</div>
                      <ul className="space-y-1">
                        {c.items.map((i) => (
                          <li key={i.slug}>
                            <Link href={`/wiki/${i.slug}`} className="block rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-900/60 hover:text-white">
                              {i.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}


