"use client"
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Hexagon, HelpCircle, Laptop, DollarSign, HeadphonesIcon, Smartphone, Shield, Lightbulb, Users, Gamepad2, Wrench, MessageCircle, Mail, ChevronDown, ChevronUp, Search } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

export default function FAQ() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Client-side'da Discord URL'ini güncelle
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
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

  const faqs = [
    {
      icon: HelpCircle,
      question: "What is AuraFX?",
      answer: "AuraFX is a web-based tool for creating advanced particle effects for Minecraft servers using the MythicMobs plugin. It allows you to visually design, preview, and export effects without coding.",
      category: "General"
    },
    {
      icon: Laptop,
      question: "Do I need to know coding?",
      answer: "No coding is required! You can design effects visually and export ready-to-use YAML code for MythicMobs.",
      category: "General"
    },
    {
      icon: DollarSign,
      question: "Is AuraFX free?",
      answer: "Yes, AuraFX is completely free to use for everyone. We believe in making advanced effect creation accessible to all Minecraft creators.",
      category: "General"
    },
    {
      icon: HeadphonesIcon,
      question: "How can I get support?",
      answer: "You can contact us via email or join our Discord community for live help and discussions. Our community is very active and helpful!",
      category: "Support"
    },
    {
      icon: Smartphone,
      question: "Can I use AuraFX on mobile?",
      answer: "While AuraFX is web-based and technically accessible on mobile devices, it's primarily designed for desktop use. The complex interface with multiple panels, precise canvas interactions, and detailed editing features work best on larger screens with mouse/keyboard input. For the optimal experience, we recommend using AuraFX on a desktop or laptop computer.",
      category: "Technical"
    },
    {
      icon: Shield,
      question: "Is my data safe?",
      answer: "We take privacy seriously. Your data is never shared with third parties except as required for legal compliance. See our Privacy Policy for details.",
      category: "Privacy"
    },
    {
      icon: Lightbulb,
      question: "Can I contribute or suggest features?",
      answer: "Absolutely! We welcome feedback and suggestions. Please contact us or join our Discord to share your ideas and help shape the future of AuraFX.",
      category: "Community"
    },
    {
      icon: Users,
      question: "Who is behind AuraFX?",
      answer: "AuraFX is developed by passionate Minecraft plugin developers and designers who understand the needs of server owners and creators.",
      category: "General"
    },
    {
      icon: Gamepad2,
      question: "What Minecraft versions are supported?",
      answer: "AuraFX generates effects compatible with MythicMobs, which supports most modern Minecraft versions. Check MythicMobs documentation for specific version compatibility.",
      category: "Technical"
    },
    {
      icon: Wrench,
      question: "Can I import my own models?",
      answer: "Yes! You can import PNG images and OBJ 3D models to create custom particle effects based on your own designs.",
      category: "Features"
    }
  ];

  const categories = ["All", "General", "Technical", "Support", "Features", "Privacy", "Community"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpandedItems(filteredFaqs.map((_, index) => index));
  };

  const collapseAll = () => {
    setExpandedItems([]);
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
            Frequently Asked <span className="font-extralight text-gradient">Questions</span>
          </h1>

          <p className="font-body text-xl md:text-2xl text-black/70 max-w-3xl mx-auto mb-12 leading-relaxed slide-in" style={{ animationDelay: '0.3s' }}>
            Find answers to the most commonly asked questions about AuraFX and particle effect creation.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-black/10 rounded-full text-black placeholder-black/40 focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative py-12 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-gray-50 text-black border border-black/10 hover:bg-gray-100"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4 mb-8">
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
        </div>
      </section>

      {/* FAQ Items */}
      <section className="relative py-8 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-black/10 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleExpanded(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                      <faq.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-black">{faq.question}</h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-black/60 text-sm rounded-full">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {expandedItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-black/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-black/60" />
                    )}
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${expandedItems.includes(index) ? 'max-h-96' : 'max-h-0'
                  }`}>
                  <div className="px-8 pb-6 pl-24">
                    <p className="font-body text-black/70 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-xl text-black/60">No questions found matching your search.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-6 py-3 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-12 border border-black/10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold text-black mb-4">Still Have Questions?</h2>
              <p className="font-body text-lg text-black/70 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our community and support team are here to help you get the most out of AuraFX.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Message
                  <ChevronDown className="w-4 h-4 ml-2 rotate-270 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <a
                  href={discordUrl}
                  suppressHydrationWarning={true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center px-8 py-4 border-2 border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Join Discord
                  <ChevronDown className="w-4 h-4 ml-2 rotate-270 group-hover:translate-x-1 transition-transform duration-300" />
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