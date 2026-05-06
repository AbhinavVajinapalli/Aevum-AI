export type LifecycleStage = "pre" | "during" | "post"

export type CampaignStatus = "draft" | "approved" | "sent"

export type Platform = "email" | "linkedin" | "whatsapp" | "instagram"

export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  lifecycleStage: LifecycleStage
  urgencyScore: number
  createdAt: string
}

export interface ContentVariation {
  id: string
  content: string
  isSelected: boolean
}

export interface PlatformContent {
  platform: Platform
  variations: ContentVariation[]
}

export interface Campaign {
  id: string
  eventId: string
  eventName: string
  status: CampaignStatus
  platforms: PlatformContent[]
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: "campaign_generated" | "content_approved" | "post_sent" | "event_created"
  message: string
  timestamp: string
}

export interface DashboardStats {
  totalEvents: number
  pendingApprovals: number
  campaignsGenerated: number
  contentSent: number
}

export interface AnalyticsData {
  postsByPlatform: { platform: string; count: number }[]
  approvalRate: { approved: number; rejected: number }
  totalCampaigns: number
  successRate: number
}
