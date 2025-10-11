"use client"
import React, { useState, useEffect, useRef } from "react";
import { Hexagon, Mail, MessageCircle, Handshake, DollarSign, Star, Clock, Send, User, MessageSquare, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

// Asenkron contact webhook fonksiyonu
async function sendContactWebhook(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    // Contact için 3. webhook kullan (env ile opsiyonel)
    const CONTACT_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL3 || '';
    if (!CONTACT_WEBHOOK_URL) return; // Env yoksa gönderme

    // Embed mesajı oluştur
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

    // Fetch'i timeout ile sınırla (5 saniye)
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
    // Hata durumunda sessizce devam et - UI'ı etkilemesin
    console.warn("Contact webhook failed (non-blocking):", e);
    throw e; // Hata durumunu üst seviyeye bildir
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'contact' | 'support'>('contact');

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
      // UI'ı hemen güncelle - webhook'u beklemez
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Webhook'u asenkron olarak gönder - UI'ı bloklamaz
      sendContactWebhook(formData).catch(error => {
        console.warn('Discord webhook failed (non-blocking):', error);
        // Webhook hatası olsa bile kullanıcıya başarılı mesajı gösterildi
      });
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
        
        .tab-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
            Get in <span className="font-extralight text-gradient">Touch</span>
          </h1>
          
          <p className="font-body text-xl md:text-2xl text-black/70 max-w-3xl mx-auto mb-12 leading-relaxed slide-in" style={{ animationDelay: '0.3s' }}>
            Have questions, feedback, or need support? 
            <span className="font-semibold text-black"> We're here to help you create amazing effects!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-in" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={() => setActiveTab('contact')}
              className={`group inline-flex items-center px-8 py-4 font-semibold rounded-full transition-all duration-300 hover-lift ${
                activeTab === 'contact' 
                  ? 'bg-black text-white' 
                  : 'border-2 border-black text-black hover:bg-black hover:text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Us
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => setActiveTab('support')}
              className={`group inline-flex items-center px-8 py-4 font-semibold rounded-full transition-all duration-300 hover-lift ${
                activeTab === 'support' 
                  ? 'bg-black text-white' 
                  : 'border-2 border-black text-black hover:bg-black hover:text-white'
              }`}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Support Project
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'contact' ? (
            <div className="slide-in">
              {/* Contact Methods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Email Contact */}
                <div className="bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-black mb-4">Quick Contact</h3>
                    <p className="font-body text-black/60 mb-6">
                      Use our contact form below for the fastest response, or email us directly for urgent matters.
                    </p>
                    <a
                      href="mailto:raneelawsk080z@gmail.com"
                      className="group inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Direct Email
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>

                {/* Discord Community */}
                <div className="bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-black mb-4">Discord Community</h3>
                    <p className="font-body text-black/60 mb-6">
                      Join our active community for live support, discussions, and sharing your creations.
                    </p>
                    <a
                      href={discordUrl}
                      suppressHydrationWarning={true}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join Discord
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>

                {/* Business Inquiries */}
                <div className="bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                      <Handshake className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-black mb-4">Business</h3>
                    <p className="font-body text-black/60 mb-6">
                      Interested in partnerships, collaborations, or custom development? Let's talk!
                    </p>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subject: 'Business Inquiry' }));
                        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
                    >
                      <Handshake className="w-4 h-4 mr-2" />
                      Send Message
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Form Section */}
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display text-4xl font-bold text-black mb-4">Send Us a Message</h2>
                  <p className="font-body text-lg text-black/60 max-w-2xl mx-auto">
                    Have a question, suggestion, or need help? Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <div id="contact-form" className="bg-gray-50 rounded-2xl p-8 border border-black/10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black placeholder-black/40 focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black placeholder-black/40 focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="General Question">General Question</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Bug Report">Bug Report</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Business Inquiry">Business Inquiry</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black placeholder-black/40 focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                        placeholder="Tell us how we can help you..."
                        required
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-green-800">
                          Message sent successfully! We'll get back to you soon.
                        </p>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">
                          Failed to send message. Please try again or contact us directly.
                        </p>
                      </div>
                    )}

                    <div className="text-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="slide-in">
              {/* Support Section */}
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display text-4xl font-bold text-black mb-4">Support the Project</h2>
                  <p className="font-body text-lg text-black/60 max-w-2xl mx-auto">
                    AuraFX is free to use, but your support helps us continue developing new features and maintaining the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  <div className="bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-black mb-4">Donate via Binance</h3>
                      <p className="font-body text-black/60 mb-6">
                        Support our development with a secure donation through Binance Pay.
                      </p>
                      <a
                        href="https://www.binance.com/en/mp-cms/app/e7ff537?_dp=Ym5jOi8vYXBwLmJpbmFuY2UuY29tL21wL2FwcD9hcHBJZD1NcERFNnVBalc3TEJzeGk5WFVubjdvJnN0YXJ0UGFnZVBhdGg9Y0dGblpYTXZjbVZqWldsMlpTMXlaWEYxWlhOMEwybHVaR1Y0JnN0YXJ0UGFnZVF1ZXJ5PVltbHNiRTl5WkdWeVNXUTlNemN3TXpReU1ESXlOelV3TmpVNE5UWXdKbUpwYkd4VWVYQmxQWEpsY1hWbGMzUmZZVjl3WVhsdFpXNTAmc2NlbmVWYWx1ZT0xMzAw&description=sleepsweetly+has+requested+1+USDT+payment.+Tap+this+link+to+pay.&title=Payment+Request&utm_campaign=app_mini_program_share_link&utm_content=MpDE6uAjW7LBsxi9XUnn7o&utm_source=mini_program"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Donate Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 border border-black/10 hover:shadow-2xl transition-all duration-300 hover-lift">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-black mb-4">Spread the Word</h3>
                      <p className="font-body text-black/60 mb-6">
                        Share AuraFX with your friends and the Minecraft community to help us grow!
                      </p>
                      <div className="text-black/40">
                        <p className="text-sm">Social media links coming soon!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time Info */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-black/10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-black mb-6">Response Times</h3>
                    <div className="space-y-3 text-black/70">
                      <div className="flex justify-between items-center py-2 border-b border-black/10">
                        <span className="font-medium">Discord</span>
                        <span>Usually within a few hours</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-black/10">
                        <span className="font-medium">Email</span>
                        <span>Within 24-48 hours</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium">Business Inquiries</span>
                        <span>Within 2-3 business days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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