"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Calendar, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlatformContentCard } from "@/components/campaigns/platform-content-card"
import type { Event, Platform, PlatformContent } from "@/lib/types"

// Mock event data - replace with API call
const mockEvent: Event = {
  id: "1",
  name: "Tech Conference 2025",
  description:
    "Annual technology conference featuring the latest innovations in AI, cloud computing, and software development. Join industry leaders and innovators for two days of inspiring talks and hands-on workshops.",
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  location: "San Francisco, CA",
  lifecycleStage: "pre",
  urgencyScore: 85,
  createdAt: new Date().toISOString(),
}

// Mock generated content
const generateMockContent = (): PlatformContent[] => [
  {
    platform: "email",
    variations: [
      {
        id: "email-1",
        content:
          "Subject: Join Us at Tech Conference 2025!\n\nDear [Name],\n\nWe're excited to invite you to Tech Conference 2025 in San Francisco! This year's event features groundbreaking sessions on AI, cloud computing, and the future of software development.\n\nDon't miss this opportunity to connect with industry leaders and gain insights that will shape your career.\n\nRegister now to secure your spot!\n\nBest regards,\nThe Tech Conference Team",
        isSelected: true,
      },
      {
        id: "email-2",
        content:
          "Subject: Tech Conference 2025 - Your Invitation Awaits\n\nHello [Name],\n\nThe countdown to Tech Conference 2025 has begun! Join us in San Francisco for an unforgettable experience filled with innovation, networking, and learning.\n\nThis year's agenda includes exclusive workshops and keynotes from the brightest minds in tech.\n\nSecure your seat today!\n\nWarm regards,\nThe Event Team",
        isSelected: false,
      },
      {
        id: "email-3",
        content:
          "Subject: You're Invited: Tech Conference 2025\n\nHi [Name],\n\nMark your calendar for Tech Conference 2025! We're bringing together the tech community in San Francisco for two days of inspiration and innovation.\n\nDiscover the latest trends, meet potential collaborators, and take your skills to the next level.\n\nRegister before seats fill up!\n\nCheers,\nTech Conference 2025",
        isSelected: false,
      },
    ],
  },
  {
    platform: "linkedin",
    variations: [
      {
        id: "linkedin-1",
        content:
          "🚀 Exciting news! Tech Conference 2025 is coming to San Francisco!\n\nJoin us for two days of innovation, networking, and learning from industry leaders in AI, cloud computing, and software development.\n\nThis is your chance to:\n• Connect with 500+ tech professionals\n• Attend hands-on workshops\n• Discover emerging technologies\n\nEarly bird registration is now open. Link in comments!\n\n#TechConference2025 #Innovation #AI #CloudComputing",
        isSelected: true,
      },
      {
        id: "linkedin-2",
        content:
          "The future of tech is being shaped NOW. Are you ready to be part of it?\n\nTech Conference 2025 brings together the brightest minds in technology for an immersive experience in San Francisco.\n\nWhat to expect:\n✅ Keynotes from industry pioneers\n✅ Interactive workshops\n✅ Networking opportunities\n\nDon't miss out - register today!\n\n#TechEvent #Networking #TechCommunity",
        isSelected: false,
      },
      {
        id: "linkedin-3",
        content:
          "Looking to level up your tech career? 🎯\n\nTech Conference 2025 is your opportunity to learn from the best, network with peers, and discover what's next in technology.\n\nSan Francisco | Coming Soon\n\nSpots are limited. Secure yours now!\n\n#CareerGrowth #TechEvents #ProfessionalDevelopment",
        isSelected: false,
      },
    ],
  },
  {
    platform: "whatsapp",
    variations: [
      {
        id: "whatsapp-1",
        content:
          "Hey! 👋\n\nTech Conference 2025 is happening in San Francisco and you're invited!\n\n📅 Date: Coming soon\n📍 Location: San Francisco, CA\n\nJoin 500+ tech enthusiasts for workshops, talks, and networking.\n\nInterested? Reply YES for the registration link!",
        isSelected: true,
      },
      {
        id: "whatsapp-2",
        content:
          "Big news! 🎉\n\nTech Conference 2025 is around the corner!\n\nTwo days of:\n• Amazing speakers\n• Hands-on workshops\n• Great networking\n\nWant to join us in San Francisco? Let me know!",
        isSelected: false,
      },
      {
        id: "whatsapp-3",
        content:
          "Quick update! 📢\n\nTech Conference 2025 registration is now open!\n\nIf you're into AI, cloud, or software dev - this is THE event to attend.\n\nReply for more info or the direct link to register!",
        isSelected: false,
      },
    ],
  },
  {
    platform: "instagram",
    variations: [
      {
        id: "instagram-1",
        content:
          "The future is calling. Will you answer? 🚀\n\nTech Conference 2025 is coming to San Francisco!\n\nTwo days of innovation, inspiration, and incredible connections await.\n\n💡 AI & Machine Learning\n☁️ Cloud Computing\n💻 Software Development\n\nLink in bio to register!\n\n#TechConference #Innovation #SanFrancisco #TechEvent #AI",
        isSelected: true,
      },
      {
        id: "instagram-2",
        content:
          "Your next big breakthrough starts here. ✨\n\nJoin us at Tech Conference 2025 in San Francisco for an unforgettable tech experience.\n\n🎤 World-class speakers\n🛠️ Hands-on workshops\n🤝 Networking with the best\n\nSpots are filling up fast!\n\n#TechCommunity #Conference2025 #TechLife",
        isSelected: false,
      },
      {
        id: "instagram-3",
        content:
          "San Francisco is calling all tech enthusiasts! 🌉\n\nTech Conference 2025 is your gateway to the future of technology.\n\nDon't just watch the future happen - be part of creating it.\n\nRegister now 👉 Link in bio\n\n#FutureOfTech #TechEvent #Innovation",
        isSelected: false,
      },
    ],
  },
]

export default function GenerateCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [platforms, setPlatforms] = useState<PlatformContent[] | null>(null)
  const [approvedPlatforms, setApprovedPlatforms] = useState<Set<Platform>>(
    new Set()
  )

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPlatforms(generateMockContent())
    setIsGenerating(false)
  }

  const handleSelectVariation = (platform: Platform, variationId: string) => {
    if (!platforms) return
    setPlatforms((prev) =>
      prev!.map((p) =>
        p.platform === platform
          ? {
              ...p,
              variations: p.variations.map((v) => ({
                ...v,
                isSelected: v.id === variationId,
              })),
            }
          : p
      )
    )
  }

  const handleUpdateContent = (
    platform: Platform,
    variationId: string,
    content: string
  ) => {
    if (!platforms) return
    setPlatforms((prev) =>
      prev!.map((p) =>
        p.platform === platform
          ? {
              ...p,
              variations: p.variations.map((v) =>
                v.id === variationId ? { ...v, content } : v
              ),
            }
          : p
      )
    )
  }

  const handleApprove = (platform: Platform, variationId: string) => {
    setApprovedPlatforms((prev) => new Set([...prev, platform]))
  }

  const allApproved =
    platforms && approvedPlatforms.size === platforms.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Generate Campaign
          </h1>
          <p className="text-muted-foreground">
            Create AI-powered promotional content for your event
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{mockEvent.name}</h3>
              <p className="mt-1 text-muted-foreground">
                {mockEvent.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(mockEvent.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {mockEvent.location}
              </div>
              <Badge variant="outline">Urgency: {mockEvent.urgencyScore}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {!platforms && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Ready to Generate</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Click the button below to generate AI-powered marketing content for
            all platforms
          </p>
          <Button
            className="mt-6"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      )}

      {platforms && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Generated Content</h2>
              <p className="text-sm text-muted-foreground">
                Review, edit, and approve content for each platform
              </p>
            </div>
            {allApproved && (
              <Button onClick={() => router.push("/dashboard/approvals")}>
                View in Approvals
              </Button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {platforms.map((platformContent) => (
              <PlatformContentCard
                key={platformContent.platform}
                platform={platformContent.platform}
                variations={platformContent.variations}
                onSelectVariation={(variationId) =>
                  handleSelectVariation(platformContent.platform, variationId)
                }
                onUpdateContent={(variationId, content) =>
                  handleUpdateContent(
                    platformContent.platform,
                    variationId,
                    content
                  )
                }
                onApprove={(variationId) =>
                  handleApprove(platformContent.platform, variationId)
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
