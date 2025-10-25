"use client"
import React, { useState, useEffect, useRef } from "react";
import { Mail, FileText, ChevronRight } from "lucide-react";

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("introduction");
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: "introduction", title: "Introduction", number: "01" },
    { id: "use", title: "Use of Service", number: "02" },
    { id: "content", title: "User Content", number: "03" },
    { id: "property", title: "Intellectual Property", number: "04" },
    { id: "privacy", title: "Privacy & Data", number: "05" },
    { id: "responsibilities", title: "User Responsibilities", number: "06" },
    { id: "disclaimer", title: "Disclaimer", number: "07" },
    { id: "changes", title: "Changes to Terms", number: "08" },
    { id: "contact", title: "Contact", number: "09" }
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap');
        
        body {
          font-family: 'Lora', serif;
        }
        
        .font-heading {
          font-family: 'Outfit', sans-serif;
        }
        
        .font-body {
          font-family: 'Lora', serif;
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
          background-color: #1e40af;
          border-radius: 50%;
        }
        
        .section-number {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: #e0e7ff;
        }
      `}</style>

      {/* Header */}
      <header className="relative border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading text-sm font-medium text-gray-500 uppercase tracking-wider">Legal</p>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-black mb-6">Terms of Service</h1>
            <p className="font-body text-lg text-gray-600 leading-relaxed">
              Please read these terms carefully before using AuraFX. By using our service, you agree to these terms.
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
                    className={`toc-item block w-full text-left py-2 text-sm font-medium ${activeSection === section.id
                        ? "text-blue-900 font-semibold active-toc"
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
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">01</span>
              <h2 className="font-heading text-3xl font-bold text-black">Introduction</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed mb-4">
              By accessing or using <strong className="font-heading">AuraFX</strong> ("the Service"), you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
            </p>
            <p className="font-body text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your use of our website and any related services offered by AuraFX. By using our service, you agree to these terms.
            </p>
          </section>

          {/* Use of Service Section */}
          <section
            id="use"
            ref={(el) => { sectionsRef.current["use"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">02</span>
              <h2 className="font-heading text-3xl font-bold text-black">Use of Service</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">You must be at least 13 years old to use this service.</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">Do not use the service for unlawful purposes or to harm others.</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">Do not attempt to disrupt, hack, or reverse engineer the service.</p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-gray-700">Respect the rights and privacy of other users.</p>
              </li>
            </ul>
          </section>

          {/* User Content Section */}
          <section
            id="content"
            ref={(el) => { sectionsRef.current["content"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">03</span>
              <h2 className="font-heading text-3xl font-bold text-black">User Content</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed">
              You are responsible for any content you create or upload using AuraFX. Do not upload or share content that is illegal, offensive, or infringes on others' rights.
            </p>
          </section>

          {/* Intellectual Property Section */}
          <section
            id="property"
            ref={(el) => { sectionsRef.current["property"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">04</span>
              <h2 className="font-heading text-3xl font-bold text-black">Intellectual Property</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed">
              All content, trademarks, and code on AuraFX are the property of their respective owners. You may not copy, distribute, or use any content without permission.
            </p>
          </section>

          {/* Privacy & Data Section */}
          <section
            id="privacy"
            ref={(el) => { sectionsRef.current["privacy"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">05</span>
              <h2 className="font-heading text-3xl font-bold text-black">Privacy & Data</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed">
              We respect your privacy and only collect data necessary to improve our services. Please review our Privacy Policy for detailed information.
            </p>
          </section>

          {/* User Responsibilities Section */}
          <section
            id="responsibilities"
            ref={(el) => { sectionsRef.current["responsibilities"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">06</span>
              <h2 className="font-heading text-3xl font-bold text-black">User Responsibilities</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>
          </section>

          {/* Disclaimer Section - Highlighted */}
          <section
            id="disclaimer"
            ref={(el) => { sectionsRef.current["disclaimer"] = el }}
            className="mb-16 scroll-mt-24 bg-blue-50 p-8 -mx-8 rounded-lg"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4 text-blue-900">07</span>
              <h2 className="font-heading text-3xl font-bold text-black">Disclaimer & Limitation of Liability</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed">
              AuraFX is provided "as is" and without warranties of any kind. We are not liable for any damages, data loss, or issues arising from the use of this service.
            </p>
          </section>

          {/* Changes to Terms Section */}
          <section
            id="changes"
            ref={(el) => { sectionsRef.current["changes"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">08</span>
              <h2 className="font-heading text-3xl font-bold text-black">Changes to Terms</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed">
              We reserve the right to update these Terms at any time. Continued use of the service after changes means you accept the new terms.
            </p>
          </section>

          {/* Contact Section */}
          <section
            id="contact"
            ref={(el) => { sectionsRef.current["contact"] = el }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <span className="section-number text-3xl mr-4">09</span>
              <h2 className="font-heading text-3xl font-bold text-black">Contact Us</h2>
            </div>
            <p className="font-body text-gray-700 leading-relaxed mb-6">
              If you have any questions about these Terms of Service, please don't hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center font-heading font-medium text-blue-900 hover:underline"
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