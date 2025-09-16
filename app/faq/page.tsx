"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Laptop, DollarSign, HeadphonesIcon, Smartphone, Shield, Lightbulb, Users, Gamepad2, Wrench, MessageCircle, Mail } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

export default function FAQ() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  useEffect(() => {
    // Client-side'da Discord URL'ini güncelle
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
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
      answer: "Yes, AuraFX is optimized for both desktop and mobile devices. You can create effects on any device with a modern web browser.",
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
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredFaqs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-8">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            FAQ
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Find answers to the most commonly asked questions about AuraFX and particle effect creation.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <faq.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                      <span className="px-3 py-1 bg-gradient-to-r from-green-600/20 to-blue-600/20 text-green-400 text-sm rounded-full border border-green-500/20">
                        {faq.category}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our community and support team are here to help you get the most out of AuraFX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Link>
              <a
                href={discordUrl}
                suppressHydrationWarning={true}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-800/50 text-white font-semibold rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 