import type { Metadata } from 'next'
import WikiSidebar from '@/components/wiki/new/WikiSidebar'
import WikiAppBar from '@/components/wiki/new/WikiAppBar'

export const metadata: Metadata = {
  title: 'AuraFX Help Center',
  description: 'Documentation for AuraFX',
  generator: 'AuraFX',
}

export default function WikiNewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col">
      <WikiAppBar />

      <div className="flex flex-1 pt-16 max-w-[1920px] mx-auto w-full">
        {/* Drawer (Sidebar) */}
        <div className="hidden lg:block">
          <WikiSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
