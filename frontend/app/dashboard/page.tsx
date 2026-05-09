"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, Sparkles, Send, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  getDashboardSnapshot,
  publishWhatsApp,
  publishEmail,
  type DashboardSnapshot,
  type BackendEvent,
  type BackendCampaignSummary,
} from "@/lib/backend"
import { getApprovedContent, type BackendContentItem } from "@/lib/backend"

type UiActivity = {
  id: string
  type: "campaign_generated" | "content_approved" | "post_sent" | "event_created"
  message: string
  timestamp: string
}

function lifecycleToUiStage(stage: BackendEvent["lifecycle_stage"]) {
  if (stage === "during_event") return "during" as const
  if (stage === "post_event") return "post" as const
  return "pre" as const
}

function eventToUi(event: BackendEvent) {
  return {
    id: event.id,
    name: event.title,
    description: event.description,
    date: event.start_time,
    location: event.event_type.replace(/_/g, " "),
    lifecycleStage: lifecycleToUiStage(event.lifecycle_stage),
    urgencyScore: event.urgency_score * 10,
    createdAt: event.created_at || event.synced_at || event.start_time,
  }
}

function buildActivities(snapshot: DashboardSnapshot): UiActivity[] {
  const campaignActivities = snapshot.campaigns.slice(0, 3).map((campaign) => ({
    id: `campaign-${campaign.id}`,
    type: "campaign_generated" as const,
    message: `Campaign ready for ${campaign.event_name}`,
    timestamp: campaign.created_at,
  }))

  const approvalActivities = snapshot.pendingApprovals.slice(0, 3).map((item) => ({
    id: `approval-${item.id}`,
    type: item.platform === "email" ? ("content_approved" as const) : ("post_sent" as const),
    message: `${item.platform.toUpperCase()} content queued for ${item.event_title || "an event"}`,
    timestamp: item.created_at || item.updated_at || new Date().toISOString(),
  }))

  const eventActivities = snapshot.events.slice(0, 2).map((event) => ({
    id: `event-${event.id}`,
    type: "event_created" as const,
    message: `Event synced: ${event.title}`,
    timestamp: event.synced_at || event.created_at || event.start_time,
  }))

  return [...campaignActivities, ...approvalActivities, ...eventActivities].slice(0, 6)
}

function CampaignRow({ campaign }: { campaign: BackendCampaignSummary }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{campaign.event_name}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {campaign.content_count} content pieces • {campaign.lifecycle_stage}
          </div>
        </div>
        <Badge variant="outline" className={cn("capitalize")}>{campaign.status}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
        {Object.entries(campaign.status_breakdown).map(([status, count]) => (
          <div key={status} className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="capitalize">{status}</div>
            <div className="font-semibold text-foreground">{count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderContentText(raw: any) {
  if (!raw && raw !== 0) return ""
  if (typeof raw === "string") return raw
  if (Array.isArray(raw)) {
    try {
      // If array of objects with 'content' field, join them
      if (raw.length > 0 && typeof raw[0] === "object" && raw[0] !== null && 'content' in raw[0]) {
        return raw.map((r: any) => r.content).join('\n\n')
      }
      return raw.map((r: any) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n\n')
    } catch {
      return JSON.stringify(raw)
    }
  }
  if (typeof raw === 'object') {
    // Try common fields
    if (raw.content) return String(raw.content)
    return JSON.stringify(raw)
  }
  return String(raw)
}

function ApprovalRow({ item }: { item: BackendContentItem }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              {item.platform}
            </Badge>
            <span className="text-sm text-muted-foreground">{item.event_title || "Untitled event"}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{renderContentText(item.content_text)}</p>
        </div>
        <div className="flex items-center gap-2">
          {item.platform === "whatsapp" && item.approval_status === "approved" && (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const raw = window.prompt("Enter WhatsApp recipient phone number (with country code, e.g. 9490476031 or +919490476031)")
                  if (!raw) return
                  // Normalize: if user entered without +, assume +91 (India)
                  const recipient = raw.startsWith("+") ? raw : "+91" + raw
                  console.log("Sending WhatsApp to:", recipient)
                  const res = await publishWhatsApp(item.id, recipient)
                  window.alert(res?.message || "WhatsApp send requested")
                } catch (err: any) {
                  window.alert("Error: " + (err?.message || String(err)))
                }
              }}
            >
              Send
            </Button>
          )}

          {item.platform === "email" && item.approval_status === "approved" && (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const defaultEmail = (process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL || "").trim()
                  const recipient = window.prompt("Enter recipient email (leave empty to use default)", defaultEmail)
                  if (recipient === null) return
                  const to = (recipient && recipient.trim()) || defaultEmail
                  if (!to) {
                    window.alert("No recipient provided")
                    return
                  }
                  console.log("Sending email to:", to)
                  const res = await publishEmail(item.id, to, true)
                  window.alert(res?.message || "Email send requested")
                } catch (err: any) {
                  window.alert("Error: " + (err?.message || String(err)))
                }
              }}
            >
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [approvedContent, setApprovedContent] = useState<BackendContentItem[]>([])

  const loadSnapshot = async () => {
    try {
      setError(null)
      const data = await getDashboardSnapshot()
      setSnapshot(data)
      // Also fetch approved content for Send buttons
      try {
        const approved = await getApprovedContent(8)
        console.log("Loaded approved content:", approved)
        setApprovedContent(approved)
      } catch (approvalErr) {
        console.error("Failed to load approved content:", approvalErr)
        setApprovedContent([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  useEffect(() => {
    loadSnapshot()
  }, [])

  const uiEvents = useMemo(
    () => snapshot?.events.map(eventToUi) || [],
    [snapshot]
  )

  const activities = useMemo(
    () => (snapshot ? buildActivities(snapshot) : []),
    [snapshot]
  )

  const stats = snapshot?.analytics

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-950/20 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/75">
            Aevum AI Control Center
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Live event promotion dashboard</h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Real events, live campaigns, approval workflows, and publishing status from the backend.
            </p>
          </div>
          {snapshot?.integrations && (
            <div className="flex flex-wrap gap-2 text-xs text-white/80">
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">LinkedIn {snapshot.integrations.linkedin.mode}</Badge>
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">SMTP {snapshot.integrations.smtp.mode}</Badge>
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">Gemini {snapshot.integrations.gemini.mode}</Badge>
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">Calendar {snapshot.integrations.calendar.mode}</Badge>
            </div>
          )}
        </div>

      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats?.total_events ?? 0}
          icon={Calendar}
          description="Synced from Google Calendar"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_content ?? 0}
          icon={Clock}
          description="Awaiting review"
        />
        <StatCard
          title="Campaigns Generated"
          value={stats?.total_campaigns ?? 0}
          icon={Sparkles}
          description="Generated for active events"
        />
        <StatCard
          title="Content Sent"
          value={stats?.content_sent ?? 0}
          icon={Send}
          description="Published from the approval queue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityFeed activities={activities} />
        <UpcomingEvents events={uiEvents} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot?.campaigns.length ? (
              snapshot.campaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            ) : loading ? (
              <div className="text-sm text-muted-foreground">Loading campaigns...</div>
            ) : (
              <div className="text-sm text-muted-foreground">No campaigns yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedContent.length ? (
              approvedContent.slice(0, 5).map((item) => (
                <ApprovalRow key={item.id} item={item} />
              ))
            ) : loading ? (
              <div className="text-sm text-muted-foreground">Loading approvals...</div>
            ) : (
              <div className="text-sm text-muted-foreground">No approved content ready to send.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}