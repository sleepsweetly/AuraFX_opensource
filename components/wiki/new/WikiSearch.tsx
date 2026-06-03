"use client"

import React, { useState } from 'react'
import { Command } from 'cmdk'
import { Search, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { listArticles } from '@/lib/wiki-data'
import { motion, AnimatePresence } from 'framer-motion'

export function WikiSearch() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const articles = listArticles()

    // No keyboard shortcut listener as requested ("No K icon")

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="relative flex items-center w-full max-w-[720px] mx-auto h-12 px-6 bg-[#f1f3f4] hover:bg-white hover:shadow-md transition-all duration-200 rounded-full cursor-text group border border-transparent hover:border-zinc-200"
            >
                <Search className="w-5 h-5 text-zinc-500 mr-4 group-hover:text-blue-600 transition-colors" />
                <span className="text-[16px] text-zinc-500 group-hover:text-zinc-700">Search for help...</span>
            </div>

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            className="relative w-full max-w-[720px] overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
                        >
                            <Command className="w-full">
                                <div className="flex items-center border-b border-zinc-100 px-6 h-16">
                                    <Search className="mr-4 h-6 w-6 shrink-0 text-blue-600" />
                                    <Command.Input
                                        placeholder="Describe your issue"
                                        className="flex h-full w-full bg-transparent text-lg text-zinc-900 outline-none placeholder:text-zinc-400"
                                        autoFocus
                                    />
                                </div>

                                <Command.List className="max-h-[400px] overflow-y-auto p-2">
                                    <Command.Empty className="py-8 text-center text-zinc-500">
                                        No results found.
                                    </Command.Empty>

                                    {articles.map((article) => (
                                        <Command.Item
                                            key={article.slug}
                                            value={`${article.title} ${article.description}`}
                                            onSelect={() => {
                                                setOpen(false)
                                                router.push(`/wiki/${article.slug}`)
                                            }}
                                            className="group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-zinc-700 aria-selected:bg-blue-50 aria-selected:text-blue-700 transition-colors"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 group-aria-selected:bg-blue-100 group-aria-selected:text-blue-600">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[15px]">{article.title}</span>
                                                <span className="text-sm text-zinc-500 group-aria-selected:text-blue-600/80 line-clamp-1">
                                                    {article.description}
                                                </span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.List>
                            </Command>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
