"use client"

import React from 'react'
import Link from 'next/link'
import { listCategories } from '@/lib/wiki-data'
import { Book, Zap, Layers, Box, FileText, HelpCircle, ArrowRight } from 'lucide-react'
import { WikiSearch } from '@/components/wiki/new/WikiSearch'

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'introduction': return Zap
    case 'basics': return Layers
    case 'workflows': return FileText
    case 'advanced': return Box
    case 'support': return HelpCircle
    default: return Book
  }
}

export default function WikiLandingPage() {
  const categories = listCategories()

  return (
    <div className="flex flex-col items-center min-h-full">
      {/* Hero / Search Section */}
      <div className="w-full bg-[#f8f9fa] py-20 px-8 flex flex-col items-center text-center border-b border-zinc-200">
        <h1 className="text-4xl md:text-5xl font-normal text-[#202124] mb-8 tracking-tight">
          How can we help you?
        </h1>

        <div className="w-full max-w-[720px] mx-auto">
          <WikiSearch />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="w-full max-w-[1200px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name)
            return (
              <Link
                href={`/wiki/${category.items[0].slug}`}
                key={category.name}
                className="group flex flex-col p-8 rounded-2xl border border-zinc-200 hover:shadow-lg transition-all duration-200 bg-white"
              >
                <div className="mb-6 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-[#202124] mb-2">
                  {category.name}
                </h3>
                <p className="text-zinc-500 mb-6 flex-1">
                  Browse articles related to {category.name} to get started and master AuraFX.
                </p>
                <span className="flex items-center text-blue-600 font-medium text-sm">
                  View articles
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>

        {/* Popular Articles */}
        <div className="mt-20">
          <h2 className="text-2xl font-normal text-[#202124] mb-8">Popular Articles</h2>
          <div className="bg-white rounded-2xl border border-zinc-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {categories.flatMap(c => c.items).slice(0, 6).map(item => (
                <Link key={item.slug} href={`/wiki/${item.slug}`} className="flex items-center py-2 text-zinc-600 hover:text-blue-600 hover:underline">
                  <FileText className="w-4 h-4 mr-3 opacity-50" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
