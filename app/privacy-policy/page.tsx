import React from "react";
import { Lock, BarChart3, Settings, Link, Shield, Scale, Baby, RotateCcw, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: BarChart3,
      title: "Information We Collect",
      content: [
        { label: "Personal Information", desc: "Such as your email address, if you contact us or sign up for updates." },
        { label: "Usage Data", desc: "Information about how you use our site, including pages viewed, features used, and time spent." },
        { label: "Cookies & Tracking", desc: "We use cookies and similar technologies to enhance your experience and analyze site usage." }
      ]
    },
    {
      icon: Settings,
      title: "How We Use Your Information",
      content: [
        "To provide, operate, and maintain our website and services",
        "To improve, personalize, and expand our services",
        "To communicate with you, including support and updates",
        "To analyze usage and trends to improve user experience",
        "To comply with legal obligations"
      ]
    },
    {
      icon: Link,
      title: "Third-Party Services",
      content: "We may use third-party services (such as Google Analytics, AdSense, Discord) to help operate our website and analyze usage. These services may collect information as described in their own privacy policies."
    },
    {
      icon: Shield,
      title: "Data Security",
      content: "We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure."
    },
    {
      icon: Scale,
      title: "Your Rights",
      content: [
        "You may request access to, correction of, or deletion of your personal data at any time.",
        "You can opt out of cookies via your browser settings.",
        "You can control personalized advertising through Google Ads Settings."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            We are committed to protecting your privacy and being transparent about how we collect and use your information.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 mb-12">
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-white">AuraFX</strong> ("we", "us", or "our") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              
              {Array.isArray(section.content) ? (
                <div className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {typeof item === 'string' ? (
                        <div className="flex items-start">
                          <span className="text-blue-400 mr-3 mt-1">•</span>
                          <p className="text-gray-300">{item}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-900/30 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">{item.label}:</h4>
                          <p className="text-gray-300">{item.desc}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 leading-relaxed">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AdSense Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Advertising and AdSense</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>We use Google AdSense to display advertisements on our website. Google AdSense uses cookies and similar technologies to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <span className="text-orange-400 mr-2">•</span>
                  Display personalized advertisements based on your interests
                </div>
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <span className="text-orange-400 mr-2">•</span>
                  Analyze website traffic and user behavior
                </div>
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <span className="text-orange-400 mr-2">•</span>
                  Provide relevant content and advertisements
                </div>
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <span className="text-orange-400 mr-2">•</span>
                  Improve the effectiveness of advertising campaigns
                </div>
              </div>
              <p>
                You can opt out of personalized advertising by visiting{" "}
                <a href="https://www.google.com/settings/ads" className="text-orange-400 underline hover:text-orange-300" target="_blank" rel="noopener noreferrer">
                  Google Ads Settings
                </a>{" "}
                or by using browser extensions that block tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Sections */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Children's Privacy</h2>
            </div>
            <p className="text-gray-300">
              Our website is not intended for children under 13. We do not knowingly collect personal information from children.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
            </div>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Questions About Privacy?</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about this Privacy Policy, please don't hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </a>
            <p className="mt-6 text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 