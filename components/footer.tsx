"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { siteConfig, getDiscordInviteUrl } from '@/lib/config';

const Footer = () => {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  useEffect(() => {
    // Client-side'da Discord URL'ini güncelle
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, []);

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Image
                  src="/icon.png"
                  alt="AuraFX Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <h3 className="text-3xl font-bold text-white tracking-tight">AuraFX</h3>
              </div>
              <p className="text-zinc-400 text-base leading-relaxed max-w-md">
                Professional particle effect creation editor for MythicMobs plugin.
                Craft stunning visual effects with precision and creativity.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-zinc-400 hover:text-indigo-400 transition-all duration-300"
                suppressHydrationWarning={true}
              >
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Discord</span>
              </a>
              <a
                href="mailto:raneelawsk080z@gmail.com"
                className="group flex items-center space-x-2 text-zinc-400 hover:text-indigo-400 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Contact</span>
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg relative">
              Resources
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/wiki", label: "Documentation" },
                { href: "/about", label: "About" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Support" },
                { href: "/legacy", label: "Legacy Version" }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-all duration-200 text-sm flex items-center space-x-2 group"
                  >
                    <div className="w-1 h-1 bg-zinc-600 rounded-full group-hover:bg-indigo-400 transition-colors duration-200"></div>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg relative">
              Legal
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms-of-service", label: "Terms of Service" },
                { href: "/ads.txt", label: "Advertisers" }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-all duration-200 text-sm flex items-center space-x-2 group"
                  >
                    <div className="w-1 h-1 bg-zinc-600 rounded-full group-hover:bg-indigo-400 transition-colors duration-200"></div>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Greek Quote - Above divider */}
        <div className="flex justify-center mb-6">
          <span
            className="text-zinc-700 text-xs opacity-30 select-none pointer-events-none"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}
          >
            ίσως σε άλλα σώματα
          </span>
        </div>

        {/* Elegant Divider */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-black px-6">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center space-y-8">
          {/* Copyright */}
          <div className="text-center">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} AuraFX. All rights reserved.
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Made with ❤️ by sleepsweetly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;