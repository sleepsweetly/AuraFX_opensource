"use client"
import React, { useState, useEffect } from "react";
import { Phone, Mail, MessageCircle, Handshake, DollarSign, Star, Clock, Send, User, MessageSquare } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

// Asenkron contact webhook fonksiyonu
async function sendContactWebhook(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    // Contact için 3. webhook kullan (DISCORD_WEBHOOK_URL3)
    const CONTACT_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL3 || 'https://canary.discord.com/api/webhooks/1405597412462170294/H71wFAbfnp528cRfQQBj_Puv36J2ti8Uq6dSUpBtr3F5Es02ge1IDuME-r-AqrRfVKp9';

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

  useEffect(() => {
    // Client-side'da Discord URL'ini güncelle
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Have questions, feedback, or need support? We're here to help you create amazing effects!
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Email Contact */}
            <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 hover:border-green-400/40 transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Quick Contact</h3>
                <p className="text-gray-300 mb-6">
                  Use our contact form below for the fastest response, or email us directly for urgent matters.
                </p>
                <a
                  href="mailto:raneelawsk080z@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Direct Email
                </a>
              </div>
            </div>

            {/* Discord Community */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/40 transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Discord Community</h3>
                <p className="text-gray-300 mb-6">
                  Join our active community for live support, discussions, and sharing your creations.
                </p>
                <a
                  href={discordUrl}
                  suppressHydrationWarning={true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Discord
                </a>
              </div>
            </div>

            {/* Business Inquiries */}
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 hover:border-orange-400/40 transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Business & Partnerships</h3>
                <p className="text-gray-300 mb-6">
                  Interested in partnerships, collaborations, or custom development? Let's talk!
                </p>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, subject: 'Business Inquiry' }));
                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Send Us a Message</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Have a question, suggestion, or need help? Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <div id="contact-form" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-center">
                    ✅ Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-center">
                    ❌ Failed to send message. Please try again or contact us directly.
                  </p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Support the Project</h2>
              <p className="text-gray-300 mb-6">
                AuraFX is free to use, but your support helps us continue developing new features and maintaining the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Donate via Binance</h3>
                <p className="text-gray-300 mb-6">
                  Support our development with a secure donation through Binance Pay.
                </p>
                <a
                  href="https://www.binance.com/en/mp-cms/app/e7ff537?_dp=Ym5jOi8vYXBwLmJpbmFuY2UuY29tL21wL2FwcD9hcHBJZD1NcERFNnVBalc3TEJzeGk5WFVubjdvJnN0YXJ0UGFnZVBhdGg9Y0dGblpYTXZjbVZqWldsMlpTMXlaWEYxWlhOMEwybHVaR1Y0JnN0YXJ0UGFnZVF1ZXJ5PVltbHNiRTl5WkdWeVNXUTlNemN3TXpReU1ESXlOelV3TmpVNE5UWXdKbUpwYkd4VWVYQmxQWEpsY1hWbGMzUmZZVjl3WVhsdFpXNTAmc2NlbmVWYWx1ZT0xMzAw&description=sleepsweetly+has+requested+1+USDT+payment.+Tap+this+link+to+pay.&title=Payment+Request&utm_campaign=app_mini_program_share_link&utm_content=MpDE6uAjW7LBsxi9XUnn7o&utm_source=mini_program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-300"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Donate Now
                </a>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Spread the Word</h3>
                <p className="text-gray-300 mb-6">
                  Share AuraFX with your friends and the Minecraft community to help us grow!
                </p>
                <div className="text-gray-400">
                  <p className="text-sm">Social media links coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Response Times</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong>Discord:</strong> Usually within a few hours</p>
              <p><strong>Email:</strong> Within 24-48 hours</p>
              <p><strong>Business Inquiries:</strong> Within 2-3 business days</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 