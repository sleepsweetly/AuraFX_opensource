"use client"

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Hexagon, Target, MessageCircle, Rocket, ArrowRight, Sparkles, ChevronDown, Palette, Zap, FolderOpen, Settings, Users, Smartphone, Code, Layers, Eye, Download } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

export default function About() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Cursor Follower */}
      <div
        className="fixed w-6 h-6 bg-black rounded-full pointer-events-none z-40 mix-blend-difference transition-transform duration-100"
        style={{
          transform: `translate(${mousePosition.x - 12}px, ${mousePosition.y - 12}px) scale(${scrollProgress > 10 ? 1.5 : 1})`
        }}
      />

      {/* Modern Font Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .font-body {
          font-family: 'Inter', sans-serif;
        }
        
        .animate-in {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-10px) scale(1.02);
        }
        
        .text-shadow {
          text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
        }
        
        .clip-text {
          background: linear-gradient(135deg, #000 0%, #666 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .parallax {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Metin taşmasını önlemek için */
        .text-overflow-ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .text-overflow-wrap {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .text-truncate-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Hero Section - Split Screen */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-5" />

        <div className="relative w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Side - Text */}
          <div className="flex items-center justify-center p-6 md:p-12 lg:p-20">
            <div className="max-w-xl w-full">
              <div className="overflow-hidden mb-6 md:mb-8">
                <div className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-black text-white rounded-full text-xs md:text-sm font-medium animate-in stagger-1">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Version 2.0 Now Available
                </div>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none mb-4 md:mb-6 animate-in stagger-2 break-words">
                Aura<span className="font-light">FX</span>
              </h1>

              <p className="font-body text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 leading-relaxed animate-in stagger-3 text-overflow-wrap">
                Revolutionary particle effect creator.
                <span className="font-semibold text-black block"> No code. Just creativity.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-in stagger-4">
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 bg-black text-white font-medium rounded-full hover-lift text-sm md:text-base"
                >
                  <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-45 transition-transform duration-500" />
                  Launch Creator
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform duration-500" />
                </Link>

                <a
                  href="https://www.youtube.com/@walkingbackwardz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 border-2 border-black text-black font-medium rounded-full hover:bg-black hover:text-white transition-all duration-300 text-sm md:text-base"
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-180 transition-transform duration-700" />
                  Watch Demo
                </a>
              </div>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="relative flex items-center justify-center p-6 md:p-12 lg:p-20 bg-black">
            <div className="relative w-full h-64 md:h-96 lg:h-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 md:w-64 md:h-64 lg:w-96 lg:h-96 border-4 border-white rounded-full animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-48 md:h-48 lg:w-72 lg:h-72 border-2 border-white rounded-full animate-ping" />
              </div>
              <div className="relative z-10">
                <Hexagon className="w-16 h-16 md:w-32 md:h-32 lg:w-48 lg:h-48 text-white animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
        </div>
      </section>

      {/* Mission Section - Bold Typography */}
      <section ref={el => { sectionRefs.current[0] = el }} className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="mb-6 md:mb-8">
                <span className="font-display text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Our Mission</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 md:mb-8 break-words">
                Democratizing
                <span className="block font-light">Creativity</span>
              </h2>
              <p className="font-body text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8 text-overflow-wrap">
                AuraFX was born from a simple belief: everyone should be able to create stunning visual effects.
                We're breaking down the barriers between imagination and implementation,
                putting professional tools in the hands of creators everywhere.
              </p>
              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="flex-shrink-0">
                  <div className="font-display text-2xl md:text-3xl lg:text-4xl font-bold">100%</div>
                  <div className="font-body text-xs md:text-sm text-gray-500">Open Source</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="font-display text-2xl md:text-3xl lg:text-4xl font-bold">0$</div>
                  <div className="font-body text-xs md:text-sm text-gray-500">Forever Free</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="font-display text-2xl md:text-3xl lg:text-4xl font-bold">∞</div>
                  <div className="font-body text-xs md:text-sm text-gray-500">Possibilities</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute inset-0 bg-black transform rotate-3" />
                <div className="relative bg-white border-2 border-black p-6 md:p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Target className="w-16 h-16 md:w-24 md:h-24 text-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Interactive Grid */}
      <section ref={el => { sectionRefs.current[1] = el }} className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 break-words">
              Powerful
              <span className="block font-light">Features</span>
            </h2>
            <p className="font-body text-base md:text-lg lg:text-xl text-gray-400">
              Everything you need to create magic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Palette, title: "Visual Canvas", desc: "Real-time 2D/3D preview with multiple view modes" },
              { icon: Zap, title: "Instant Export", desc: "Generate optimized YAML code instantly" },
              { icon: FolderOpen, title: "Asset Import", desc: "Import PNG textures and OBJ models" },
              { icon: Layers, title: "Layer System", desc: "Professional layer management" },
              { icon: Users, title: "Open Source", desc: "Free forever with community support" },
              { icon: Smartphone, title: "Web-Based", desc: "Works anywhere, no installation needed" }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white text-black p-6 md:p-8 hover:bg-gray-100 transition-all duration-300 cursor-pointer hover-lift overflow-hidden"
              >
                <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-white transition-colors duration-300">
                    <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-black transition-colors duration-300" />
                  </div>
                  <h3 className="font-display text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 group-hover:text-white transition-colors duration-300 break-words">
                    {feature.title}
                  </h3>
                  <p className="font-body text-sm md:text-base text-gray-600 group-hover:text-gray-300 transition-colors duration-300 text-overflow-wrap">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section ref={el => { sectionRefs.current[2] = el }} className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 break-words">
              How It
              <span className="block font-light">Works</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-black hidden lg:block" />

            <div className="space-y-12 md:space-y-16 lg:space-y-20">
              {[
                { step: "01", title: "Design", desc: "Place particles with precision on our intuitive canvas" },
                { step: "02", title: "Animate", desc: "Bring your effects to life with powerful animation tools" },
                { step: "03", title: "Export", desc: "Generate clean code ready for your server" }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? 'justify-start lg:justify-end' : 'justify-start lg:justify-start'}`}
                >
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'text-right pr-0 lg:pr-12' : 'text-left pl-0 lg:pl-12'}`}>
                    <div className="inline-block text-left lg:text-right">
                      <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 opacity-20">
                        {item.step}
                      </div>
                      <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold mb-2 break-words">
                        {item.title}
                      </h3>
                      <p className="font-body text-sm md:text-base lg:text-lg text-gray-600 text-overflow-wrap">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-base">{item.step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Full Width */}
      <section ref={el => { sectionRefs.current[3] = el }} className="relative py-20 md:py-32 px-4 md:px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 md:mb-8 break-words">
            Ready to Create
            <span className="block font-light">Magic?</span>
          </h2>
          <p className="font-body text-base md:text-lg lg:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto text-overflow-wrap">
            Join thousands of creators transforming their Minecraft servers with AuraFX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <Link
              href="/"
              className="group inline-flex items-center justify-center px-8 py-4 md:px-12 md:py-5 bg-white text-black font-semibold rounded-full hover-lift text-sm md:text-base"
            >
              <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-45 transition-transform duration-500" />
              Start Creating Now
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform duration-500" />
            </Link>

            <a
              href={discordUrl}
              suppressHydrationWarning={true}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-8 py-4 md:px-12 md:py-5 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm md:text-base"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Join Community
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative py-8 md:py-12 px-4 md:px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Hexagon className="w-5 h-5 md:w-6 md:h-6 text-black mr-2" />
            <span className="font-display text-lg md:text-xl font-bold">AuraFX</span>
          </div>
          <p className="font-body text-gray-500 text-xs md:text-sm text-center md:text-right">
            © 2024 Crafted with passion for the Minecraft community
          </p>
        </div>
      </footer>
    </div>
  );
}