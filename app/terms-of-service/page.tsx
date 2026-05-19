"use client"
import React, { useState, useEffect, useRef } from "react";
import { Hexagon, FileText, Users, Upload, Copyright, AlertTriangle, RotateCcw, Mail, ChevronDown, ChevronUp, Scale, Shield } from "lucide-react";

export default function TermsOfService() {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    const handleScroll = () => {
      const newVisibleSections = new Set<number>();
      
      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
          
          if (isVisible) {
            newVisibleSections.add(index);
          }
        }
      });
      
      setVisibleSections(prev => new Set([...prev, ...newVisibleSections]));
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      icon: Users,
      title: "Use of Service",
      content: [
        "You must be at least 13 years old to use this service.",
        "Do not use the service for unlawful purposes or to harm others.",
        "Do not attempt to disrupt, hack, or reverse engineer the service.",
        "Respect the rights and privacy of other users."
      ]
    },
    {
      icon: Upload,
      title: "User Content",
      content: "You are responsible for any content you create or upload using AuraFX. Do not upload or share content that is illegal, offensive, or infringes on others' rights."
    },
    {
      icon: Copyright,
      title: "Intellectual Property",
      content: "All content, trademarks, and code on AuraFX are the property of their respective owners. You may not copy, distribute, or use any content without permission."
    },
    {
      icon: Shield,
      title: "Privacy & Data",
      content: "We respect your privacy and only collect data necessary to improve our services. Please review our Privacy Policy for detailed information."
    },
    {
      icon: Scale,
      title: "User Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account."
    },
    {
      icon: AlertTriangle,
      title: "Disclaimer & Limitation of Liability",
      content: "AuraFX is provided \"as is\" and without warranties of any kind. We are not liable for any damages, data loss, or issues arising from the use of this service."
    },
    {
      icon: RotateCcw,
      title: "Changes to Terms",
      content: "We reserve the right to update these Terms at any time. Continued use of the service after changes means you accept the new terms."
    }
  ];

  const toggleExpanded = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpandedSections(sections.map((_, index) => index));
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

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
        
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        .stagger-5 { transition-delay: 0.5s; }
        .stagger-6 { transition-delay: 0.6s; }
        .stagger-7 { transition-delay: 0.7s; }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-90" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className={`mb-8 slide-in ${visibleSections.has(0) ? 'visible' : ''}`} style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-3xl float-animation shadow-2xl">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className={`font-display text-7xl md:text-8xl font-black text-black mb-6 slide-in ${visibleSections.has(0) ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
            Terms of <span className="font-extralight text-gradient">Service</span>
          </h1>
          
          <p className={`font-body text-xl md:text-2xl text-black/70 max-w-3xl mx-auto mb-12 leading-relaxed slide-in ${visibleSections.has(0) ? 'visible' : ''}`} style={{ animationDelay: '0.3s' }}>
            Please read these terms carefully before using AuraFX. By using our service, you agree to these terms.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="relative py-12 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div ref={el => { sectionRefs.current[1] = el }} className={`bg-gray-50 rounded-3xl p-8 border border-black/10 fade-in ${visibleSections.has(1) ? 'visible' : ''}`}>
            <p className="font-body text-lg text-black/80 leading-relaxed">
              By accessing or using <strong className="font-display text-black">AuraFX</strong> ("the Service"), you agree to be bound by these Terms of Service. 
              Please read them carefully before using our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="relative py-6 px-6 z-10">
        <div ref={el => { sectionRefs.current[2] = el }} className={`max-w-4xl mx-auto flex justify-center gap-4 fade-in ${visibleSections.has(2) ? 'visible' : ''}`}>
          <button
            onClick={expandAll}
            className="text-sm text-black/60 hover:text-black transition-colors"
          >
            Expand All
          </button>
          <span className="text-black/20">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-black/60 hover:text-black transition-colors"
          >
            Collapse All
          </button>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="relative py-8 px-6 z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              ref={el => { sectionRefs.current[index + 3] = el }}
              className={`bg-white rounded-2xl border border-black/10 overflow-hidden hover:shadow-xl transition-all duration-300 fade-in stagger-${index + 1} ${visibleSections.has(index + 3) ? 'visible' : ''}`}
            >
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-black">{section.title}</h2>
                </div>
                <div className="flex-shrink-0">
                  {expandedSections.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-black/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-black/60" />
                  )}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                expandedSections.includes(index) ? 'max-h-96' : 'max-h-0'
              }`}>
                <div className="px-8 pb-6 pl-24">
                  {Array.isArray(section.content) ? (
                    <div className="space-y-4">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <div className="flex items-start">
                            <span className="text-black/40 mr-3 mt-1">•</span>
                            <p className="font-body text-black/70">{item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-black/70 leading-relaxed">{section.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-24 px-6 z-10">
        <div ref={el => { sectionRefs.current[10] = el }} className={`max-w-4xl mx-auto fade-in ${visibleSections.has(10) ? 'visible' : ''}`}>
          <div className="bg-gray-50 rounded-3xl p-12 border border-black/10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold text-black mb-4">Questions About Terms?</h2>
              <p className="font-body text-lg text-black/70 mb-8 max-w-2xl mx-auto">
                If you have any questions about these Terms of Service, please don't hesitate to contact us.
              </p>
              <a
                href="/contact"
                className="group inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Message
              </a>
              <p className="mt-8 text-sm text-black/50">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-black/10 z-10">
        <div ref={el => { sectionRefs.current[11] = el }} className={`max-w-6xl mx-auto text-center fade-in ${visibleSections.has(11) ? 'visible' : ''}`}>
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