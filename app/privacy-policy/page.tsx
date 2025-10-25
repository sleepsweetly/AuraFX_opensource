"use client"
import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, User, Shield, Database, Globe, ChevronRight } from "lucide-react";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information", title: "Information We Collect" },
    { id: "usage", title: "How We Use Your Information" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "security", title: "Data Security" },
    { id: "rights", title: "Your Rights" },
    { id: "future", title: "Future Data Collection" },
    { id: "contact", title: "Contact Us" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = sectionsRef.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    sectionsRef.current[sectionId]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Font Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Poppins:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Merriweather', serif;
        }
        
        .font-heading {
          font-family: 'Poppins', sans-serif;
        }
        
        .font-body {
          font-family: 'Merriweather', serif;
        }
        
        .toc-item {
          transition: all 0.2s ease;
        }
        
        .toc-item:hover {
          transform: translateX(4px);
        }
        
        .active-toc {
          position: relative;
        }
        
        .active-toc::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          background-color: #000;
          border-radius: 50%;
        }
      `}</style>

      {/* Header */}
      <header className="relative border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading text-sm font-medium text-gray-500 uppercase tracking-wider">Legal</p>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-black mb-6">Privacy Policy</h1>
            <p className="font-body text-lg text-gray-600 leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="font-body text-sm text-gray-500 mt-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col md:flex-row gap-12">
        {/* Table of Contents - Sticky Sidebar */}
        <aside className="md:w-64 md:sticky md:top-24 md:h-fit">
          <nav>
            <h3 className="font-heading text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Table of Contents</h3>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`toc-item block w-full text-left py-2 text-sm font-medium ${
                      activeSection === section.id
                        ? "text-black font-semibold active-toc"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl">
          {/* Introduction Section */}
          <section
            id="introduction"
            ref={(el) => { sectionsRef.current["introduction"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">Introduction</h2>
            <p className="font-body text-gray-700 leading-relaxed mb-4">
              <strong className="font-heading">AuraFX</strong> ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="font-body text-gray-700 leading-relaxed">
              By using AuraFX, you consent to the data practices described in this policy. If you do not agree with the terms of this privacy policy, please do not access or use our website.
            </p>
          </section>

          {/* Information We Collect Section */}
          <section
            id="information"
            ref={(el) => { sectionsRef.current["information"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">Information We Collect</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-xl font-semibold text-black mb-2">Personal Information</h3>
                <p className="font-body text-gray-700 leading-relaxed">
                  We may collect personal information such as your email address, but only if you provide it to us voluntarily when contacting us or signing up for updates.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-black mb-2">Usage Data</h3>
                <p className="font-body text-gray-700 leading-relaxed">
                  We collect information about how you use our site, including pages viewed, features used, and time spent. This helps us understand user behavior and improve our services.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-black mb-2">Cookies & Tracking</h3>
                <p className="font-body text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience and analyze site usage. You can control cookies through your browser settings.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information Section */}
          <section
            id="usage"
            ref={(el) => { sectionsRef.current["usage"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">How We Use Your Information</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">To provide, operate, and maintain our website and services</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">To improve, personalize, and expand our services</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">To communicate with you, including support and updates</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">To analyze usage and trends to improve user experience</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">To comply with legal obligations</p>
              </li>
            </ul>
          </section>

          {/* Third-Party Services Section */}
          <section
            id="third-party"
            ref={(el) => { sectionsRef.current["third-party"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">Third-Party Services</h2>
            <p className="font-body text-gray-700 leading-relaxed">
              We may use third-party services (such as Google Analytics, Discord) to help operate our website and analyze usage. These services may collect information as described in their own privacy policies.
            </p>
          </section>

          {/* Data Security Section */}
          <section
            id="security"
            ref={(el) => { sectionsRef.current["security"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">Data Security</h2>
            <p className="font-body text-gray-700 leading-relaxed">
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Your Rights Section */}
          <section
            id="rights"
            ref={(el) => { sectionsRef.current["rights"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">Your Rights</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">You may request access to, correction of, or deletion of your personal data at any time.</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">You can opt out of cookies via your browser settings.</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">You can control personalized advertising through Google Ads Settings.</p>
              </li>
            </ul>
          </section>

          {/* Future Data Collection Section - Highlighted */}
          <section
            id="future"
            ref={(el) => { sectionsRef.current["future"] = el }}
            className="mb-16 scroll-mt-24 bg-gray-50 p-8 -mx-8 rounded-lg"
          >
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-black mr-3" />
              <h2 className="font-heading text-3xl font-bold text-black">Future Data Collection</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed mb-4">
              We currently don't collect advertising revenue, but in the future we may implement webhooks to analyze which features or modes are most used. This will help us improve our services and prioritize development based on actual usage patterns.
            </p>
            <p className="font-body text-gray-700 leading-relaxed">
              Any future data collection will be anonymous and will not include personal information.
            </p>
          </section>

          {/* Contact Section */}
          <section
            id="contact"
            ref={(el) => { sectionsRef.current["contact"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="font-heading text-3xl font-bold text-black mb-6">Contact Us</h2>
            <p className="font-body text-gray-700 leading-relaxed mb-6">
              If you have any questions about this Privacy Policy, please don't hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center font-heading font-medium text-black hover:underline"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </a>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="font-body text-sm text-gray-500 text-center">
            © 2024 AuraFX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}