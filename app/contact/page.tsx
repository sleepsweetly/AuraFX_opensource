"use client"
import React, { useState, useEffect, useRef } from "react";
import { Hexagon, Mail, MessageCircle, Handshake, DollarSign, Star, Clock, Send, User, MessageSquare, ArrowRight, Sparkles, CheckCircle, MapPin, Phone, Grid3x3, Layers, Zap, AtSign, Globe, HeadphonesIcon } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

// Asenkron contact webhook fonksiyonu
async function sendContactWebhook(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const CONTACT_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL3 || '';
    if (!CONTACT_WEBHOOK_URL) return;

    const embed = {
      title: `📧 YENİ İLETİŞİM MESAJI`,
      description: `**${formData.subject}**`,
      color: 0x00D4AA,
      fields: [
        { name: "👤 İsim", value: formData.name || "Belirtilmemiş", inline: true },
        { name: "📧 Email", value: formData.email || "Belirtilmemiş", inline: true },
        { name: "📝 Konu", value: formData.subject || "Genel", inline: false },
        { name: "💬 Mesaj", value: formData.message.substring(0, 1000) + (formData.message.length > 1000 ? "..." : ""), inline: false }
      ],
      footer: {
        text: "AuraFX Contact Form | sleepsweety"
      },
      timestamp: new Date().toISOString()
    };

    const payload = {
      embeds: [embed]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
  } catch (e) {
    console.warn("Contact webhook failed (non-blocking):", e);
    throw e;
  }
}

export default function Contact() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

    [heroRef.current, modulesRef.current, formRef.current].forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      sendContactWebhook(formData).catch(error => {
        console.warn('Discord webhook failed (non-blocking):', error);
      });
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30"
          style={{
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30"
          style={{
            right: `${-mousePosition.x * 0.02}px`,
            bottom: `${-mousePosition.y * 0.02}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
      </div>

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
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        
        .hover-lift {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-15px) rotateX(5deg) rotateY(5deg);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        .morph-shape {
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .morph-shape:hover {
          border-radius: 1.5rem;
        }
        
        .morph-shape:hover .card-content {
          padding: 2rem;
        }
        
        .card-content {
          transition: padding 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: blob 8s ease-in-out infinite;
        }
        
        @keyframes blob {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
        }
      `}</style>

      {/* Hero Section - Asymmetrical Design */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 z-10">
        {/* Floating Elements */}
        <div className="absolute top-32 left-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blob opacity-20 float-animation" />
        <div className="absolute bottom-32 right-20 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blob opacity-20 float-animation" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full blob opacity-20 float-animation" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-screen">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="mb-8 animate-in stagger-1">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                  Let's connect and create
                </div>
              </div>
              
              <h1 className="font-display text-6xl md:text-8xl font-black leading-none mb-8 animate-in stagger-2">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              
              <p className="font-body text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed animate-in stagger-3">
                Ready to bring your ideas to life? 
                <span className="font-semibold text-gray-900"> We're just a message away from making magic happen.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-in stagger-4">
                <button 
                  onClick={() => document.getElementById('contact-modules')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover-lift"
                >
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-500" />
                  Start Conversation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-500" />
                </button>
                
                <a 
                  href={discordUrl}
                  suppressHydrationWarning={true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  <HeadphonesIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Join Discord
                </a>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-6" />
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blob opacity-20" />
                      <MessageCircle className="relative w-32 h-32 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Contact Methods - Symmetrical Layout */}
      <section id="contact-modules" ref={modulesRef} className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Choose Your <span className="gradient-text">Channel</span>
            </h2>
            <p className="font-body text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple ways to reach us - pick what works best for you
            </p>
          </div>
          
          {/* Symmetrical Card Layout - Yanyana dizilim */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Email Card */}
            <div 
              className="bg-white rounded-3xl shadow-xl hover-lift cursor-pointer overflow-hidden transition-all duration-300"
              onMouseEnter={() => setActiveCard('email')}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="p-8 h-full flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">Direct Email</h3>
                  <p className="font-body text-gray-600 text-base leading-relaxed">
                    For detailed inquiries and formal communications
                  </p>
                </div>
                <a
                  href="mailto:raneelawsk080z@gmail.com"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300 mt-6"
                >
                  Send Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>

            {/* Discord Card */}
            <div 
              className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-3xl shadow-xl hover-lift cursor-pointer overflow-hidden transition-all duration-300"
              onMouseEnter={() => setActiveCard('discord')}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="p-8 h-full flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">Discord</h3>
                  <p className="font-body text-white/90 text-base leading-relaxed">
                    Join our community for instant support and discussions
                  </p>
                </div>
                <a
                  href={discordUrl}
                  suppressHydrationWarning={true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white font-semibold hover:text-white/80 transition-colors duration-300 mt-6"
                >
                  Join Server
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>

            {/* Business Card */}
            <div 
              className="bg-white rounded-3xl shadow-xl hover-lift cursor-pointer overflow-hidden transition-all duration-300"
              onMouseEnter={() => setActiveCard('business')}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="p-8 h-full flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                    <Handshake className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">Business</h3>
                  <p className="font-body text-gray-600 text-base leading-relaxed">
                    Partnerships, custom solutions, enterprise inquiries
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, subject: 'Business Inquiry' }));
                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-300 mt-6"
                >
                  Let's Talk
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form - Centered Design */}
      <section id="contact-form" ref={formRef} className="relative py-32 px-6 z-10 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mb-8">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Send Us a Message</h2>
            <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
              We read every message and respond as quickly as possible. Your thoughts matter to us!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300"
                    placeholder="Your Name"
                    required
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                  <AtSign className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="General Question">General Question</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Business Inquiry">Business Inquiry</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
                <MessageCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 resize-none"
                  placeholder="Tell us everything on your mind..."
                  required
                />
                <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <p className="text-green-800 font-medium">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <p className="text-red-800 font-medium">
                    Failed to send message. Please try again.
                  </p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Support Section - Creative Layout */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Support <span className="gradient-text">AuraFX</span>
            </h2>
            <p className="font-body text-xl text-gray-600 max-w-2xl mx-auto">
              Help us keep creating amazing tools for the community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Donate Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500" />
              <div className="relative bg-white rounded-3xl p-10 shadow-xl transform -rotate-3 group-hover:rotate-0 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-display text-3xl font-bold mb-4">Make a Donation</h3>
                <p className="font-body text-lg text-gray-600 mb-8">
                  Your support helps us develop new features and keep AuraFX free for everyone
                </p>
                <a
                  href="https://www.binance.com/en/mp-cms/app/e7ff537?_dp=Ym5jOi8vYXBwLmJpbmFuY2UuY29tL21wL2FwcD9hcHBJZD1NcERFNnVBalc3TEJzeGk5WFVubjdvJnN0YXJ0UGFnZVBhdGg9Y0dGblpYTXZjbVZqWldsMlpTMXlaWEYxWlhOMEwybHVaR1Y0JnN0YXJ0UGFnZVF1ZXJ5PVltbHNiRTl5WkdWeVNXUTlNemN3TXpReU1ESXlOelV3TmpVNE5UWXdKbUpwYkd4VWVYQmxQWEpsY1hWbGMzUmZZVjl3WVhsdFpXNTAmc2NlbmVWYWx1ZT0xMzAw&description=sleepsweetly+has+requested+1+USDT+payment.+Tap+this+link+to+pay.&title=Payment+Request&utm_campaign=app_mini_program_share_link&utm_content=MpDE6uAjW7LBsxi9XUnn7o&utm_source=mini_program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
                >
                  Donate Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>

            {/* Share Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500" />
              <div className="relative bg-white rounded-3xl p-10 shadow-xl transform rotate-3 group-hover:rotate-0 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-display text-3xl font-bold mb-4">Spread the Word</h3>
                <p className="font-body text-lg text-gray-600 mb-8">
                  Share AuraFX with your friends and the Minecraft community
                </p>
                <div className="text-gray-500">
                  <p className="text-sm">Social media links coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative py-16 px-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <Hexagon className="w-8 h-8 text-gray-700 mr-3" />
            <span className="font-display text-2xl font-bold text-gray-900">AuraFX</span>
          </div>
          <div className="text-center md:text-right">
            <p className="font-body text-gray-600 mb-2">
              © 2024 Built with passion for creators
            </p>
            <p className="font-body text-sm text-gray-500">
              Making particle effects accessible to everyone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}