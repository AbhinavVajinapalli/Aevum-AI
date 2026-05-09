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
  type DashboardSnapshot,
  type BackendEvent,
  type BackendCampaignSummary,
} from "@/lib/backend"

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

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadSnapshot = async () => {
    try {
      setError(null)
      const data = await getDashboardSnapshot()
      setSnapshot(data)
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
            <CardTitle>Send from events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Approved content is sent from each event's detail page. Open an event to review drafts and publish email or WhatsApp using your saved defaults.
            </div>
            <Button asChild>
              <a href="/dashboard/events">Open events</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}