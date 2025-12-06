"use client"

import React from 'react'
import { Article } from '@/lib/wiki-data'
import { Calendar } from 'lucide-react'

interface WikiArticleContentProps {
    article: Article
}

export default function WikiArticleContent({ article }: WikiArticleContentProps) {
    return (
        <article className="max-w-[800px] mx-auto w-full py-8 px-4 lg:px-0">
            {/* Article Header */}
            <div className="mb-10 border-b border-zinc-200 pb-6">
                {/* Breadcrumb-like helper */}
                <div className="flex items-center gap-2 mb-4 text-[14px] text-zinc-500">
                    <span>Documentation</span>
                    <span>/</span>
                    <span className="text-zinc-800 font-medium">{article.category}</span>
                </div>

                <h1 className="text-[32px] sm:text-[40px] font-normal text-[#202124] mb-4 leading-tight tracking-tight">
                    {article.title}
                </h1>

                <p className="text-[18px] text-[#5f6368] leading-relaxed mb-6 font-light">
                    {article.description}
                </p>

                <div className="flex items-center gap-6 text-[12px] text-zinc-500 uppercase tracking-wider font-medium">
                    {article.lastUpdated && (
                        <span>Last updated: {article.lastUpdated}</span>
                    )}
                    {article.version && (
                        <span>Version: {article.version}</span>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-12">
                {article.sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-24">
                        <h2 className="text-[24px] font-normal text-[#202124] mb-4">
                            {section.title}
                        </h2>
                        <div className="space-y-4 text-[16px] text-[#3c4043] leading-7">
                            {section.paragraphs.map((p, pIndex) => (
                                <p key={pIndex}>{p}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </article>
    )
}
