"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { listCategories } from '@/lib/wiki-data'
import { cn } from '@/lib/utils'

// Force re-render with new data
export default function WikiSidebar() {
    const pathname = usePathname()
    const categories = listCategories()
    // Default open all for documentation style
    const [openCategories, setOpenCategories] = useState<string[]>(
        categories.map(c => c.name)
    )

    const toggleCategory = (name: string) => {
        setOpenCategories(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        )
    }

    return (
        <aside className="w-[300px] flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto custom-scrollbar border-r border-zinc-200 bg-white">
            <div className="py-4 px-2 space-y-1">

                {categories.map((category) => (
                    <div key={category.name} className="mb-2">
                        <button
                            onClick={() => toggleCategory(category.name)}
                            className="flex items-center w-full px-4 py-3 text-[14px] font-medium text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
                        >
                            <span className="flex-1 text-left">{category.name}</span>
                            {openCategories.includes(category.name) ? (
                                <ChevronDown className="w-5 h-5 text-zinc-500" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-zinc-500" />
                            )}
                        </button>

                        <AnimatePresence>
                            {openCategories.includes(category.name) && (
                                <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    {category.items.map((article) => {
                                        const isActive = pathname === `/wiki/${article.slug}`
                                        return (
                                            <li key={article.slug}>
                                                <Link
                                                    href={`/wiki/${article.slug}`}
                                                    className={cn(
                                                        "block mx-2 px-4 py-2.5 text-[14px] rounded-r-full rounded-l-full transition-colors ml-4",
                                                        isActive
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                                    )}
                                                >
                                                    {article.title}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </aside>
    )
}
