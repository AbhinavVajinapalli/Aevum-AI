"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCampaigns, getCampaignDetail, type BackendCampaignSummary, type BackendContentItem } from "@/lib/backend"

type CampaignView = BackendCampaignSummary & {
  content?: BackendContentItem[]
}

function statusTone(status: string) {
  if (status === "approved") return "bg-success/10 text-success border-success/20"
  if (status === "sent") return "bg-chart-1/10 text-chart-1 border-chart-1/20"
  return "bg-muted text-muted-foreground"
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      setError(null)
      const summaries = await getCampaigns(20)
      setCampaigns(summaries)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Campaign summaries and content breakdowns from the backend</p>
        </div>

      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4">
        {campaigns.map((campaign) => {
          const isOpen = expandedId === campaign.id
          return (
            <Card key={campaign.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{campaign.event_name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {campaign.content_count} pieces • {campaign.lifecycle_stage}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusTone(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-2 sm:grid-cols-4">
                    {Object.entries(campaign.status_breakdown).map(([status, count]) => (
                      <div key={status} className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <div className="capitalize text-muted-foreground">{status}</div>
                        <div className="font-semibold">{count}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (isOpen) {
                        setExpandedId(null)
                        return
                      }
                      setExpandedId(campaign.id)
                      if (!campaign.content) {
                        const detail = await getCampaignDetail(campaign.id)
                        setCampaigns((prev) => prev.map((item) => (item.id === campaign.id ? { ...item, content: detail.content } : item)))
                      }
                    }}
                  >
                    {isOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                    {isOpen ? "Hide details" : "Show details"}
                  </Button>
                </div>

                {isOpen && campaign.content && (
                  <div className="grid gap-3 border-t pt-4 md:grid-cols-2">
                    {campaign.content.map((item) => (
                      <div key={item.id} className="rounded-xl border bg-muted/20 p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="uppercase tracking-wide">{item.platform}</Badge>
                          <span className="text-xs text-muted-foreground">Var {item.variation_num}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{item.content_text}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Status: {item.approval_status}</span>
                          {item.scheduled_time && <span>Schedule: {item.scheduled_time}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!loading && campaigns.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No campaigns available.
        </div>
      )}
    </div>
  )
}