"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArticleSection } from '@/lib/wiki-data'
import { cn } from '@/lib/utils'

interface WikiTableOfContentsProps {
    sections: ArticleSection[]
}

export default function WikiTableOfContents({ sections }: WikiTableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("")

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: "-100px 0px -66% 0px" }
        )

        sections.forEach((section) => {
            const element = document.getElementById(section.id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [sections])

    if (!sections.length) return null

    return (
        <nav className="w-64 flex-shrink-0 hidden xl:block sticky top-32 h-[calc(100vh-8rem)]">
            <div className="pl-6 border-l border-zinc-200">
                <h4 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">
                    On This Page
                </h4>
                <ul className="space-y-3">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById(section.id)?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                                    setActiveId(section.id)
                                }}
                                className={cn(
                                    "block text-sm transition-colors duration-200 hover:text-purple-600",
                                    activeId === section.id
                                        ? "text-purple-600 font-medium translate-x-1"
                                        : "text-zinc-500"
                                )}
                            >
                                {section.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}
