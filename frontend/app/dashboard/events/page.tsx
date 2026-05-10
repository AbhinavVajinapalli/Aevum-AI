"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Sparkles, AlertCircle, Sparkles as SparklesIcon, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getEvents,
  getEventDetail,
  generateCampaign,
  getCampaignDetail,
  approveContent,
  bulkApproveContent,
  type BackendEvent,
  type BackendCampaignDetail,
  type BackendContentItem,
} from "@/lib/backend"

function stageLabel(stage: BackendEvent["lifecycle_stage"]) {
  if (stage === "during_event") return "During"
  if (stage === "post_event") return "Post"
  return "Pre"
}

function stageColor(stage: BackendEvent["lifecycle_stage"]) {
  if (stage === "during_event") return "bg-success/10 text-success border-success/20"
  if (stage === "post_event") return "bg-muted text-muted-foreground border-muted"
  return "bg-chart-3/10 text-chart-3 border-chart-3/20"
}

function platformLabel(platform: string) {
  if (platform === "linkedin") return "LinkedIn"
  if (platform === "email") return "Email"
  return platform
}

function contentKey(item: BackendContentItem) {
  return `${item.platform}-${item.variation_num}-${item.id}`
}

export default function EventsPage() {
  const [events, setEvents] = useState<BackendEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [eventDetails, setEventDetails] = useState<Record<string, BackendEvent>>({})
  const [campaignsByEvent, setCampaignsByEvent] = useState<Record<string, BackendCampaignDetail | null>>({})
  const [selectedContent, setSelectedContent] = useState<Record<string, boolean>>({})
  const [previewDraft, setPreviewDraft] = useState<{ eventId: string; draft: BackendContentItem } | null>(null)

  const load = async () => {
    try {
      setError(null)
      const data = await getEvents(50)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events")
    } finally {
      setLoading(false)
      setWorkingId(null)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredEvents = events.filter((event) => {
    const haystack = `${event.title} ${event.description} ${event.event_type}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Live events from Google Calendar or configured source</p>
        </div>

      </div>

      <div className="flex flex-col gap-3 sm:max-w-md">
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden border-border/70 bg-card/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
                <Badge variant="outline" className={stageColor(event.lifecycle_stage)}>
                  {stageLabel(event.lifecycle_stage)}
                </Badge>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Starts</div>
                  <div>{new Date(event.start_time).toLocaleString()}</div>
                </div>
                <div className="rounded-xl border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Urgency</div>
                  <div>{event.urgency_score}/10</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{event.event_type.replace(/_/g, " ")}</div>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/dashboard/events/${event.id}`}>View</Link>
                </Button>
              </div>

              {expandedId === event.id && (
                <div className="mt-4 rounded-2xl border bg-background/60 p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold">Full event details</div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {eventDetails[event.id]?.description || event.description}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border bg-muted/30 p-3 text-sm">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Start</div>
                          <div className="mt-1 font-medium">{new Date(event.start_time).toLocaleString()}</div>
                        </div>
                        <div className="rounded-xl border bg-muted/30 p-3 text-sm">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">End</div>
                          <div className="mt-1 font-medium">{new Date(event.end_time).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-muted/30 p-3 text-sm">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Lifecycle</div>
                        <div className="mt-1 font-medium">{stageLabel(event.lifecycle_stage)}</div>
                        <div className="mt-1 text-muted-foreground">{event.event_type.replace(/_/g, " ")}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">Suggested drafts</div>
                          <div className="text-xs text-muted-foreground">Choose what to approve, or approve the whole event.</div>
                        </div>
                        <Badge variant="outline">{campaignsByEvent[event.id]?.content.length || 0} drafts</Badge>
                      </div>

                      <ScrollArea className="h-[420px] pr-3">
                        <div className="space-y-3">
                          {campaignsByEvent[event.id]?.content?.length ? (
                            campaignsByEvent[event.id]!.content.map((item) => {
                              const draftId = contentKey(item)
                              const isSelected = !!selectedContent[item.id]
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setPreviewDraft({ eventId: event.id, draft: item })}
                                  className="group w-full rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="uppercase tracking-wide">
                                          {platformLabel(item.platform)}
                                        </Badge>
                                        <Badge variant="outline">v{item.variation_num}</Badge>
                                      </div>
                                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                        {item.content_text}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        id={`content-${item.id}`}
                                        name={`content-${item.id}`}
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          e.stopPropagation()
                                          setSelectedContent((s) => ({ ...s, [item.id]: e.target.checked }))
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setPreviewDraft({ eventId: event.id, draft: item })
                                      }}
                                    >
                                      Open draft
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        try {
                                          setWorkingId(item.id)
                                          const gen = await generateCampaign(event.id, variationLength)
                                          if (gen?.campaign_id) {
                                            const camp = await getCampaignDetail(gen.campaign_id)
                                            setCampaignsByEvent((s) => ({ ...s, [event.id]: camp }))
                                          }
                                        } catch (err) {
                                          setError(err instanceof Error ? err.message : "Failed to generate new version")
                                        } finally {
                                          setWorkingId(null)
                                        }
                                      }}
                                      disabled={workingId === item.id}
                                    >
                                      <SparklesIcon className="mr-2 h-4 w-4" />
                                      {workingId === item.id ? "Generating..." : "Generate new version"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        try {
                                          await approveContent(
                                            item.id,
                                            (process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL as string) || "dashboard-user",
                                          )
                                          if (campaignsByEvent[event.id]) {
                                            const camp = await getCampaignDetail(campaignsByEvent[event.id]!.campaign.id)
                                            setCampaignsByEvent((s) => ({ ...s, [event.id]: camp }))
                                          }
                                        } catch (err) {
                                          setError(err instanceof Error ? err.message : "Failed to approve")
                                        }
                                      }}
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Approve
                                    </Button>
                                  </div>
                                </button>
                              )
                            })
                          ) : (
                            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                              Suggested drafts will appear here after generation.
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const ids = Object.entries(selectedContent).filter(([_, v]) => v).map(([k]) => k)
                            if (ids.length === 0) {
                              setError("No items selected")
                              return
                            }
                            try {
                              setWorkingId(event.id)
                              await bulkApproveContent(
                                ids,
                                (process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL as string) || "dashboard-user",
                              )
                              if (campaignsByEvent[event.id]) {
                                const camp = await getCampaignDetail(campaignsByEvent[event.id]!.campaign.id)
                                setCampaignsByEvent((s) => ({ ...s, [event.id]: camp }))
                              }
                              setSelectedContent({})
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Bulk approve failed")
                            } finally {
                              setWorkingId(null)
                            }
                          }}
                        >
                          Approve selected
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              setWorkingId(event.id)
                              const contentIds = campaignsByEvent[event.id]?.content.map((c) => c.id) || []
                              if (contentIds.length === 0) {
                                setError("No content to approve")
                                return
                              }
                              await bulkApproveContent(
                                contentIds,
                                (process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL as string) || "dashboard-user",
                              )
                              if (campaignsByEvent[event.id]) {
                                const camp = await getCampaignDetail(campaignsByEvent[event.id]!.campaign.id)
                                setCampaignsByEvent((s) => ({ ...s, [event.id]: camp }))
                              }
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Approve all failed")
                            } finally {
                              setWorkingId(null)
                            }
                          }}
                        >
                          Approve event
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredEvents.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No events found.
        </div>
      )}

      <Dialog open={Boolean(previewDraft)} onOpenChange={(open) => !open && setPreviewDraft(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDraft?.draft ? `${platformLabel(previewDraft.draft.platform)} Draft` : "Draft preview"}</DialogTitle>
            <DialogDescription>
              Review the full draft before approving or generating another version.
            </DialogDescription>
          </DialogHeader>

          {previewDraft?.draft && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {platformLabel(previewDraft.draft.platform)}
                </Badge>
                <Badge variant="outline">Variation {previewDraft.draft.variation_num}</Badge>
                {previewDraft.draft.tone && <Badge variant="outline">{previewDraft.draft.tone}</Badge>}
              </div>

              <ScrollArea className="max-h-[48vh] rounded-xl border bg-muted/20 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground">{previewDraft.draft.content_text}</pre>
              </ScrollArea>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  Event: {events.find((item) => item.id === previewDraft.eventId)?.title || "Selected event"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setWorkingId(previewDraft.draft.id)
                        const gen = await generateCampaign(previewDraft.eventId)
                        if (gen?.campaign_id) {
                          const camp = await getCampaignDetail(gen.campaign_id)
                          setCampaignsByEvent((s) => ({ ...s, [previewDraft.eventId]: camp }))
                        }
                        setPreviewDraft(null)
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to generate new version")
                      } finally {
                        setWorkingId(null)
                      }
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate new version
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        await approveContent(
                          previewDraft.draft.id,
                          (process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL as string) || "dashboard-user",
                        )
                        if (campaignsByEvent[previewDraft.eventId]) {
                          const camp = await getCampaignDetail(campaignsByEvent[previewDraft.eventId]!.campaign.id)
                          setCampaignsByEvent((s) => ({ ...s, [previewDraft.eventId]: camp }))
                        }
                        setPreviewDraft(null)
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to approve")
                      }
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve this draft
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}