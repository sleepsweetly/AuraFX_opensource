import React from "react";
import { FileText, Users, Upload, Copyright, AlertTriangle, RotateCcw, Mail } from "lucide-react";

export default function TermsOfService() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-8">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Please read these terms carefully before using AuraFX. By using our service, you agree to these terms.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 mb-12">
            <p className="text-lg text-gray-300 leading-relaxed">
              By accessing or using <strong className="text-white">AuraFX</strong> ("the Service"), you agree to be bound by these Terms of Service. 
              Please read them carefully before using our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              
              {Array.isArray(section.content) ? (
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">•</span>
                      <p className="text-gray-300">{item}</p>
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

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Questions About Terms?</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about these Terms of Service, please don't hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300"
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