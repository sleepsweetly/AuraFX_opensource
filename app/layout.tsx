import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import CookieConsentBanner from "@/components/cookie-banner"
import Footer from "@/components/footer"
import { GuestProvider } from "@/lib/guest-context"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://aurafx.online'),
  title: 'AuraFX - MythicMobs Effect Generator',
  description: 'Create and customize powerful particle effects for MythicMobs with AuraFX. The ultimate tool for Minecraft server owners and plugin developers.',
  keywords: 'mythicmobs, minecraft, particle effect generator, 3d effect creator, visual skill editor, minecraft plugin tool, spigot plugin development, paper mc, bukkit plugins, custom particle effects, minecraft server tools, yaml code generator, aurafx, aura fx, mythic mobs editor, skill creation tool, boss fight effects, spell animation, minecraft vfx, particle animation, 3d particle system, real-time effect editor, minecraft server customization, advanced particle tools, no-code mythicmobs, visual yaml editing',
  authors: [{ name: 'Sleepsweety' }],
  creator: 'Sleepsweety',
  publisher: 'AuraFX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AuraFX - MythicMobs Effect Generator',
    description: 'Create and customize powerful particle effects for MythicMobs with AuraFX. The ultimate tool for Minecraft server owners and plugin developers.',
    url: 'https://aurafx.online',
    siteName: 'AuraFX',
    images: [
      {
        url: 'https://aurafx.online/aurafxarkaplan.png',
        width: 1200,
        height: 630,
        alt: 'AuraFX - MythicMobs Effect Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuraFX - MythicMobs Effect Generator',
    description: 'Create and customize powerful particle effects for MythicMobs with AuraFX. The ultimate tool for Minecraft server owners and plugin developers.',
    images: ['https://aurafx.online/aurafxarkaplan.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Google Analytics ID'nizi buraya ekleyin
const GA_TRACKING_ID = "G-T9SQZMG0B2"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="alternate" hrefLang="en" href="https://aurafx.online/" />
        <link rel="alternate" hrefLang="tr" href="https://aurafx.online/tr" />
        {/* Google Fonts: Caveat & Fuzzy Bubbles for headers/buttons */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fuzzy+Bubbles:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#000000" />
        <meta name="google-adsense-account" content="ca-pub-5170007489171917" />
        
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PRWWNGH9');
          `}
        </Script>
        
        {/* Google Analytics - Doğru sıralama */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Cookie consent durumunu kontrol et
            const consentStatus = localStorage.getItem('cookie_consent');
            
            // Consent mode'u consent durumuna göre ayarla
            if (consentStatus === 'granted') {
              gtag('consent', 'update', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted'
              });
            } else {
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'granted', // Analytics'i varsayılan olarak açık bırakıyoruz
                'wait_for_update': 500
              });
            }

            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              debug_mode: false, // Production'da false olmalı
              cookie_domain: 'auto',
              cookie_flags: 'SameSite=None;Secure'
            });
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5170007489171917"
          crossOrigin="anonymous"
        />
        {/* OpenCV.js for advanced PNG processing */}
        <Script
          async
          src="https://docs.opencv.org/4.x/opencv.js"
          strategy="afterInteractive"
        />
        {/* RichAds Integration - Temporarily disabled due to fetch error */}
        {/* 
        <Script
          src="https://richinfo.co/richpartners/in-page/js/richads-ob.js?pubid=981358&siteid=367134"
          async
        />
        */}
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AuraFX",
              "description": "Professional particle effect creation editor for MythicMobs plugin. Create complex and impressive particle effects with visual interface and automatic YAML code generation.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Sleepsweety"
              },
              "featureList": [
                "Visual particle effect editor",
                "3D editor integration",
                "Automatic YAML code generation",
                "Layer-based effect system",
                "Animation modes and presets",
                "PNG and OBJ file import",
                "Real-time preview",
                "MythicMobs compatibility"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PRWWNGH9"
            height="0" 
            width="0" 
            style={{display:'none',visibility:'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <GuestProvider>
          <Analytics />
          <SpeedInsights />
          {/* SEO Content - Hidden from users but visible to bots */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <h1>AuraFX - Professional MythicMobs Particle Effect Generator</h1>
            <h2>Create Advanced Particle Effects for Minecraft Servers</h2>
            <p>AuraFX is a comprehensive web-based tool designed specifically for Minecraft server owners and plugin developers who use MythicMobs. Our professional particle effect editor enables you to create stunning visual effects that enhance your server's gameplay experience.</p>
            
            <h3>Key Features and Capabilities</h3>
            <h4>Visual Editor Interface</h4>
            <p>Design particle effects using an intuitive drag-and-drop interface. Our canvas-based editor allows you to create complex patterns, shapes, and animations with ease. The visual approach eliminates the need for manual YAML coding while providing precise control over every aspect of your effects.</p>
            
            <h4>3D Editor Integration</h4>
            <p>Take your effects to the next dimension with our integrated 3D editor. Create three-dimensional particle systems, rotate and manipulate effects in real-time, and preview how your creations will look from any angle. The 3D workspace operates independently while maintaining synchronization with the main 2D canvas.</p>
            
            <h4>Layer-Based Effect System</h4>
            <p>Build complex effects by combining multiple layers. Each layer can have different particle types, colors, sizes, and behaviors. Our advanced layer system supports various effect types including rings, spheres, tornados, orbitals, and custom shapes. Reorder layers with drag-and-drop functionality and toggle visibility for testing.</p>
            
            <h4>Animation Modes and Presets</h4>
            <p>Bring your effects to life with our comprehensive animation system. Choose from global animation modes that affect all particles, or apply layer-specific animations. Features include rotation, movement, rainbow effects, chain reactions, mirror effects, and performance optimization modes.</p>
            
            <h4>Import and Export Capabilities</h4>
            <p>Import particle data from PNG images or 3D OBJ models. Our PNG importer converts pixel data into particles with customizable size, threshold, and tolerance settings. The OBJ importer extracts vertices from 3D models, perfect for creating effects based on custom shapes and structures.</p>
            
            <h4>Automatic Code Generation</h4>
            <p>Generate MythicMobs-compatible YAML code automatically. Our system creates optimized particle effect configurations that work seamlessly with the MythicMobs plugin. No manual coding required - simply design your effect visually and export the ready-to-use code.</p>
            
            <h4>Professional Tools and Utilities</h4>
            <p>Access a complete suite of professional tools including color pickers, grid snapping, shape management, and real-time preview. Our performance mode ensures smooth operation even with complex effects, while the integrated code panel provides instant feedback on your YAML output.</p>
            
            <h3>Perfect for Minecraft Server Enhancement</h3>
            <p>AuraFX is specifically designed for Minecraft server environments using the MythicMobs plugin. Create boss fight effects, spell animations, environmental effects, and custom abilities that will impress your players and enhance their gaming experience. Our tool streamlines the process of creating professional-quality particle effects without requiring extensive technical knowledge.</p>
            
            <h3>Technical Specifications</h3>
            <p>Built with Next.js 14 and modern web technologies, AuraFX provides a responsive and fast user experience. The application supports multiple languages, includes comprehensive documentation, and offers a wiki with detailed guides for all features. Our platform is optimized for both desktop and mobile devices.</p>
            
            <h3>Community and Support</h3>
            <p>Join our community of Minecraft server administrators and plugin developers. AuraFX is continuously updated with new features and improvements based on user feedback. Our comprehensive wiki provides detailed tutorials, examples, and best practices for creating amazing particle effects.</p>
          </div>
          
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <CookieConsentBanner />
        </GuestProvider>
      </body>
    </html>
  )
}
