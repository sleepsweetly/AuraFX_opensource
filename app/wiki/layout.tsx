import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AuraFX Wiki - Documentation & Tutorials',
  description: 'AuraFX Wiki with MythicMobs-inspired design - Documentation & Tutorials',
  generator: 'AuraFX',
}

export default function WikiNewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
    </>
  )
}

