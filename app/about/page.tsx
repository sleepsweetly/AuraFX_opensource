"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Target, Palette, Zap, FolderOpen, Settings, Users, Smartphone, MessageCircle, Mail, Rocket } from "lucide-react";
import { siteConfig, getDiscordInviteUrl } from "@/lib/config";

export default function About() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  useEffect(() => {
    // Client-side'da Discord URL'ini güncelle
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            About AuraFX
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional web-based particle effect generator for Minecraft server owners and plugin developers using MythicMobs.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 mb-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-lg text-gray-300">
                To make advanced effect creation easy, visual, and accessible to everyone in the Minecraft community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-4">
                <Palette className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Visual Editor</h3>
              <p className="text-gray-400">Visual drag-and-drop editor for 2D and 3D effects</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Auto Code Generation</h3>
              <p className="text-gray-400">Automatic YAML code generation for MythicMobs</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-4">
                <FolderOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Import/Export</h3>
              <p className="text-gray-400">Import/export tools for PNG and OBJ files</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-4">
                <Settings className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Layer System</h3>
              <p className="text-gray-400">Layer-based effect system and animation modes</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-4">
                <Users className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Support</h3>
              <p className="text-gray-400">Community support, documentation, and tutorials</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-4">
                <Smartphone className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Cross-Platform</h3>
              <p className="text-gray-400">Mobile and desktop compatibility</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Join Our Community</h3>
                <p className="text-gray-300 mb-6">
                  Connect with other creators, get help, and share your amazing effects with our Discord community.
                </p>
                <a 
                  href={discordUrl}
                  suppressHydrationWarning={true} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Discord
                </a>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Get in Touch</h3>
                <p className="text-gray-300 mb-6">
                  Have questions, feedback, or business inquiries? We'd love to hear from you.
                </p>
                <Link 
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of creators who use AuraFX to bring their Minecraft servers to life.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Launch Editor
          </Link>
        </div>
      </section>
    </div>
  );
} 