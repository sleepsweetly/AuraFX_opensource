'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { siteConfig, getDiscordInviteUrl } from '@/lib/config';
import { Home, MessageCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  useEffect(() => {
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Custom Font Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lora:ital,wght@0,400..700;1,400..700&display=swap');
        
        .font-bebas {
          font-family: 'Bebas Neue', cursive;
        }
        
        .font-lora {
          font-family: 'Lora', serif;
        }
      `}</style>

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-stone-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-stone-200 rounded-full filter blur-3xl"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-2xl text-center">
        
        {/* The Big 404 */}
        <div className="relative mb-8 -mt-24">
          <h1 className="font-bebas text-[20rem] leading-none text-stone-900 select-none opacity-80">
            404
          </h1>
          {/* Subtle decorative element behind the number */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-stone-400 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="font-lora text-4xl font-medium text-stone-900 mb-4">
          Oops, you&apos;ve ventured into the void.
        </h2>
        <p className="font-lora text-lg text-stone-600 mb-16 leading-relaxed max-w-lg mx-auto">
          The page you&apos;re looking for has vanished into the digital ether. 
          It might have been moved, deleted, or perhaps it never existed at all.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link 
            href="/" 
            className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-stone-900 text-white font-lora font-medium rounded-full transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Return to Civilization
          </Link>
          <a 
            href={discordUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            suppressHydrationWarning={true}
            className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-stone-900 text-stone-900 font-lora font-medium rounded-full transition-all duration-300 ease-in-out hover:bg-stone-900 hover:text-white hover:shadow-2xl hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Call for Backup
          </a>
        </div>
        
        {/* Footer Info */}
        <p className="font-lora text-sm text-stone-500">
          Still lost? Send a signal to <span className="font-semibold text-stone-700">yaslicadi</span> on Discord.
        </p>
      </div>
    </div>
  );
}