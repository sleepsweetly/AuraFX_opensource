"use client"

import React from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'

export default function WikiAppBar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-50 flex items-center px-4 lg:px-6">
            <div className="flex items-center gap-4 w-full max-w-[1920px] mx-auto">
                <button className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full lg:hidden">
                    <Menu className="w-6 h-6" />
                </button>

                <Link href="/wiki" className="flex items-center gap-2 mr-8">
                    {/* Simple Text Logo like Google */}
                    <span className="text-[22px] font-normal text-zinc-500 tracking-tight">
                        <span className="font-medium text-zinc-900">AuraFX</span> Help Center
                    </span>
                </Link>

                <div className="flex-1" />

                {/* Right side elements removed as requested */}
            </div>
        </header>
    )
}
