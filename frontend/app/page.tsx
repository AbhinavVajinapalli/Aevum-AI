"use client"

import Image from "next/image"
import { ArrowRight, Zap, Brain, Share2, BarChart3, Send } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/aevum_ai_bot"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-slate-950/80">
              <Image
                src="/logo-dark.png"
                alt="Aevum AI logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-lg">Aevum AI</span>
          </div>
          <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/15">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Automate Your Event Promotion
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
              Fetch events from Google Calendar, generate AI-powered marketing content, get approvals, and publish across LinkedIn and Email in minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15">
              <Link href="#features">Learn More</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20">
              <Link href={telegramUrl} target="_blank" rel="noreferrer">
                Telegram Bot <Send className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-white/60 pt-8 border-t border-white/10">
            <div>
              <div className="font-semibold text-white">Real-time</div>
              <div>Event sync</div>
            </div>
            <div>
              <div className="font-semibold text-white">AI-powered</div>
              <div>Content gen</div>
            </div>
            <div>
              <div className="font-semibold text-white">Multi-platform</div>
              <div>Publishing</div>
            </div>
            <div>
              <div className="font-semibold text-white">Chat-first</div>
              <div>Telegram bot</div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Everything you need to manage event promotion workflows efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 shadow-xl shadow-black/10 hover:border-white/20 hover:bg-white/8 transition">
              <Zap className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-semibold">Instant Event Sync</h3>
              <p className="text-white/60">Automatically fetch and sync events from Google Calendar in real-time.</p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 shadow-xl shadow-black/10 hover:border-white/20 hover:bg-white/8 transition">
              <Brain className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-semibold">AI Content Generation</h3>
              <p className="text-white/60">Generate personalized marketing content for each event using Gemini AI.</p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 shadow-xl shadow-black/10 hover:border-white/20 hover:bg-white/8 transition">
              <Share2 className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-semibold">Multi-Platform Publishing</h3>
              <p className="text-white/60">Approve and publish to LinkedIn, Email, WhatsApp, and Telegram from one flow.</p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 shadow-xl shadow-black/10 hover:border-white/20 hover:bg-white/8 transition">
              <BarChart3 className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-white/60">Track events, campaigns, approvals, and publishing metrics in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to streamline your event promotion?</h2>
          <p className="text-white/60">Start automating your workflow today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500">
              <Link href="/dashboard">
                Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15">
              <Link href={telegramUrl} target="_blank" rel="noreferrer">
                Open Telegram Bot <Send className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <div>&copy; 2026 Aevum AI. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms &amp; Conditions</Link>
              <a href="mailto:2303a52486@sru.edu.in" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
