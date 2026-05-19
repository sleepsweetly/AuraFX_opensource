"use client"

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Hexagon, Target, MessageCircle, Rocket, ArrowRight, Sparkles, ChevronDown, Palette, Zap, FolderOpen, Settings, Users, Smartphone, Code, Layers, Eye, Download } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

export default function About() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />
      
      {/* Custom Font Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .font-body {
          font-family: 'Inter', sans-serif;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .slide-in {
          animation: slideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .rotate-slow {
          animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-90" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-8 slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-3xl float-animation shadow-2xl">
              <Hexagon className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="font-display text-7xl md:text-8xl font-black text-black mb-6 slide-in" style={{ animationDelay: '0.2s' }}>
            Aura<span className="font-extralight text-gradient">FX</span>
          </h1>
          
          <p className="font-body text-xl md:text-2xl text-black/70 max-w-3xl mx-auto mb-12 leading-relaxed slide-in" style={{ animationDelay: '0.3s' }}>
            The ultimate visual particle effect creator for Minecraft servers. 
            <span className="font-semibold text-black"> Design, animate, and export professional effects without coding.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-in" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/"
              className="group inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300 hover-lift"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform duration-300" />
              Launch Creator
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            <a 
              href="https://www.youtube.com/@walkingbackwardz"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-8 py-4 border-2 border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              
            </a>
          </div>
          
          <div className="mt-16 slide-in" style={{ animationDelay: '0.5s' }}>
            <ChevronDown className="w-8 h-8 mx-auto text-black/30 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-12 border border-black/10 shadow-xl hover-lift">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 rotate-slow">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-4xl font-bold text-black mb-4">
                  Our Mission
                </h2>
                <p className="font-body text-lg text-black/70 leading-relaxed">
                  AuraFX was born from the need to democratize Minecraft effect creation. We believe every server owner, 
                  developer, and creative mind should have access to professional-grade particle effect tools without 
                  needing years of coding experience. Our mission is to bridge the gap between imagination and implementation.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-3xl" />
                <div className="relative bg-black rounded-2xl p-8 text-white">
                  <div className="text-5xl font-bold mb-2">Open</div>
                  <div className="text-lg opacity-80">Source & Free</div>
                  <div className="text-5xl font-bold mb-2 mt-4">Web</div>
                  <div className="text-lg opacity-80">Based Tool</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-bold text-black mb-4">
              Powerful Features
            </h2>
            <p className="font-body text-xl text-black/60">
              Everything you need to create stunning particle effects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
              <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-3">Visual Canvas</h3>
              <p className="font-body text-black/60">2D/3D canvas with real-time particle preview and multiple view modes (top, side, isometric)</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
              <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-3">Instant Export</h3>
              <p className="font-body text-black/60">Generate optimized YAML code instantly with frame-by-frame animation support</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
              <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-3">Asset Import</h3>
              <p className="font-body text-black/60">Import PNG textures and OBJ models directly into your effects</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
              <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-3">Layer System</h3>
              <p className="font-body text-black/60">Organize complex effects with professional layer management and grouping</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
              <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-gray-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-3">Open Source</h3>
              <p className="font-body text-black/60">Completely free and open source with active community contributions</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
              <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-3">Web-Based</h3>
              <p className="font-body text-black/60">Works in any modern browser - no downloads or installations required</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-6 z-10 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-bold text-black mb-4">
              How It Works
            </h2>
            <p className="font-body text-xl text-black/60">
              Create professional effects in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-4">Design</h3>
              <p className="font-body text-black/60">Use our intuitive canvas to place particles, shapes, and imported assets exactly where you want them</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-4">Animate</h3>
              <p className="font-body text-black/60">Add movement, rotation, and special effects using our powerful animation modes and layer system</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-black mb-4">Export</h3>
              <p className="font-body text-black/60">Generate clean, optimized YAML code ready to use in your Minecraft server plugins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-black rounded-3xl p-12 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 text-center">
              <h2 className="font-display text-4xl font-bold text-white mb-6">
                Ready to Create Magic?
              </h2>
              <p className="font-body text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already transforming their Minecraft servers with AuraFX
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/"
                  className="group inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:shadow-2xl transition-all duration-300 hover-lift"
                >
                  <Rocket className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                
                <a 
                  href={discordUrl}
                  suppressHydrationWarning={true} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-black/10 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Hexagon className="w-8 h-8 text-black" />
          </div>
          <p className="font-body text-black/60">
            © 2024 AuraFX. Crafted with passion for the Minecraft community.
          </p>
        </div>
      </footer>
    </div>
  );
}