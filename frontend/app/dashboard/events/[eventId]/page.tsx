"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareMore,
  Megaphone,
  Send,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  approveContent,
  bulkApproveContent,
  generateCampaign,
  getCampaignDetail,
  getCampaigns,
  getEventDetail,
  getIntegrationsStatus,
  publishEmail,
  publishLinkedIn,
  publishWhatsApp,
  publishTelegram,
  type IntegrationStatus,
  type BackendCampaignDetail,
  type BackendContentItem,
  type BackendEvent,
} from "@/lib/backend"

const DEFAULT_EMAIL_RECIPIENT = (
  process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL || "2303a52486@sru.edu.in"
).trim()

const DEFAULT_WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER || "9490476031"
).trim()

type DraftGroup = {
  platform: string
  drafts: BackendContentItem[]
  selectedIndex: number
}

type ContentLength = "short" | "medium" | "long"

type LifecycleStep = {
  key: "pre_event" | "during_event" | "post_event"
  title: string
  summary: string
  channels: Array<"email" | "sms" | "linkedin">
  tasks: string[]
}

function stageLabel(stage: BackendEvent["lifecycle_stage"]) {
  if (stage === "during_event") return "During"
  if (stage === "post_event") return "Post"
  return "Pre"
}

function platformLabel(platform: string) {
  if (platform === "linkedin") return "LinkedIn"
  if (platform === "email") return "Email"
  if (platform === "whatsapp") return "WhatsApp"
  if (platform === "telegram") return "Telegram"
  return platform
}

function platformIcon(platform: string) {
  if (platform === "linkedin") return <Megaphone className="h-4 w-4" />
  if (platform === "email") return <Mail className="h-4 w-4" />
  if (platform === "whatsapp" || platform === "telegram") return <MessageSquareMore className="h-4 w-4" />
  return <MessageSquareMore className="h-4 w-4" />
}

function getLifecycleSteps(event: BackendEvent | null): LifecycleStep[] {
  const eventKind = event?.event_type?.replace(/_/g, " ") || "event"
  return [
    {
      key: "pre_event",
      title: "Pre-event",
      summary: "Build anticipation, registrations, and reminders before the event starts.",
      channels: ["email", "sms", "linkedin"],
      tasks: [
        `Send invitation email with registration link for ${eventKind}`,
        "Share teaser posts on LinkedIn and other social channels",
        "Send reminder messages to registered attendees",
      ],
    },
    {
      key: "during_event",
      title: "During event",
      summary: "Keep attendees engaged while the event is live.",
      channels: ["email", "sms", "linkedin"],
      tasks: [
        "Send live schedule updates and room changes",
        "Share reminders and attendance prompts",
        "Post live highlights and short updates",
      ],
    },
    {
      key: "post_event",
      title: "Post-event",
      summary: "Close the loop with follow-ups, thank-yous, and recap content.",
      channels: ["email", "linkedin"],
      tasks: [
        "Send thank-you email and recap",
        "Publish highlight and summary posts",
        "Share feedback or registration follow-up links",
      ],
    },
  ]
}

function groupDraftsByPlatform(content: BackendContentItem[]) {
  const byPlatform: Record<string, BackendContentItem[]> = {}

  for (const item of content) {
    if (!byPlatform[item.platform]) byPlatform[item.platform] = []
    byPlatform[item.platform].push(item)
  }

  for (const platform of Object.keys(byPlatform)) {
    byPlatform[platform].sort((left, right) => left.variation_num - right.variation_num)
  }

  return byPlatform
}

export default function EventDetailPage() {
  const params = useParams<{ eventId?: string | string[] }>()
  const eventId = Array.isArray(params?.eventId) ? params.eventId[0] : params?.eventId

  const [event, setEvent] = useState<BackendEvent | null>(null)
  const [campaign, setCampaign] = useState<BackendCampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workingPlatform, setWorkingPlatform] = useState<string | null>(null)
  const [selectedVariationByPlatform, setSelectedVariationByPlatform] = useState<Record<string, number>>({})
  const [generationLengthByPlatform, setGenerationLengthByPlatform] = useState<Record<string, ContentLength>>({})
  const [approvedDraftIds, setApprovedDraftIds] = useState<Record<string, boolean>>({})
  const [eventPublished, setEventPublished] = useState(false)
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedText, setEditedText] = useState<string>("")  

  useEffect(() => {
    const load = async () => {
      if (!eventId) return

      try {
        setLoading(true)
        setError(null)

        const [eventDetail, campaignSummaries, integrationStatus] = await Promise.all([
          getEventDetail(eventId),
          getCampaigns(100),
          getIntegrationsStatus(),
        ])

        setEvent(eventDetail)
        setIntegrations(integrationStatus)

        const existingSummary = campaignSummaries.find((item) => item.event_id === eventId)
        let detail: BackendCampaignDetail | null = null

        if (existingSummary) {
          detail = await getCampaignDetail(existingSummary.id)
        } else {
          const generated = await generateCampaign(eventId, "medium")
          detail = await getCampaignDetail(generated.campaign_id)
        }

        setCampaign(detail)

        const grouped = groupDraftsByPlatform(detail?.content || [])
        const initialSelection: Record<string, number> = {}
        const initialLengths: Record<string, ContentLength> = {}
        for (const platform of Object.keys(grouped)) {
          initialSelection[platform] = grouped[platform][0]?.variation_num || 1
          initialLengths[platform] = "medium"
        }
        setSelectedVariationByPlatform(initialSelection)
        setGenerationLengthByPlatform(initialLengths)
        setEventPublished(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [eventId])

  const draftsByPlatform = useMemo(() => groupDraftsByPlatform(campaign?.content || []), [campaign])

  const selectedDrafts = useMemo(() => {
    return Object.values(draftsByPlatform)
      .map((drafts) => {
        const platform = drafts[0]?.platform
        if (!platform) return null
        const selectedVariation = selectedVariationByPlatform[platform] || drafts[0].variation_num
        const selected = drafts.find((draft) => draft.variation_num === selectedVariation) || drafts[0]
        return { platform, selected, drafts }
      })
      .filter(Boolean) as Array<{ platform: string; selected: BackendContentItem; drafts: BackendContentItem[] }>
  }, [draftsByPlatform, selectedVariationByPlatform])

  const lifecycleSteps = useMemo(() => getLifecycleSteps(event), [event])

  const defaultActor = process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL || "2303a52486@sru.edu.in"

  const resolveWhatsAppRecipient = () => {
    const normalized = DEFAULT_WHATSAPP_NUMBER.replace(/\s+/g, "")
    return normalized.startsWith("+") ? normalized : `+91${normalized}`
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">
        Loading event workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link href="/dashboard/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
        </Button>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    )
  }

  if (!event || !campaign) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="ghost" className="w-fit pl-0 hover:bg-transparent">
            <Link href="/dashboard/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {stageLabel(event.lifecycle_stage)} Cycle
              </Badge>
              <Badge variant="secondary">{event.event_type.replace(/_/g, " ")}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{event.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              try {
                setWorkingPlatform("event")
                const ids = selectedDrafts.map((item) => item.selected.id)
                if (!ids.length) return
                const pendingIds = selectedDrafts
                  .filter((item) => item.selected.approval_status !== "approved")
                  .map((item) => item.selected.id)

                if (pendingIds.length) {
                  await bulkApproveContent(pendingIds, defaultActor)
                }

                for (const draft of selectedDrafts) {
                  if (draft.selected.platform === "email") {
                    await publishEmail(draft.selected.id, DEFAULT_EMAIL_RECIPIENT, true)
                  }
                  if (draft.selected.platform === "linkedin") {
                    await publishLinkedIn(draft.selected.id)
                  }
                  if (draft.selected.platform === "whatsapp") {
                    await publishWhatsApp(draft.selected.id, resolveWhatsAppRecipient())
                  }
                  if (draft.selected.platform === "telegram" && (integrations?.telegram?.configured ?? false)) {
                    await publishTelegram(draft.selected.id)
                  }
                }
                const refreshed = await getCampaignDetail(campaign.campaign.id)
                setCampaign(refreshed)
                setApprovedDraftIds((state) => {
                  const next = { ...state }
                  for (const id of ids) next[id] = true
                  return next
                })
                setEventPublished(true)
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to approve event")
              } finally {
                setWorkingPlatform(null)
              }
            }}
            disabled={workingPlatform === "event" || eventPublished}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {eventPublished ? "Published" : "Publish drafts"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/80 shadow-sm lg:col-span-2">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg">Event details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Full event summary, timing, and lifecycle plan for promotions.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Start</div>
                <div className="mt-1 font-medium">{new Date(event.start_time).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">End</div>
                <div className="mt-1 font-medium">{new Date(event.end_time).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Urgency</div>
                <div className="mt-1 font-medium">{event.urgency_score}/10</div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Lifecycle</div>
                <div className="mt-1 font-medium">{stageLabel(event.lifecycle_stage)}</div>
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="h-4 w-4" /> Total lifecycle
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {lifecycleSteps.map((step) => {
                  const active = step.key === event.lifecycle_stage
                  return (
                    <div
                      key={step.key}
                      className={
                        active
                          ? "rounded-2xl border border-primary/40 bg-primary/10 p-4"
                          : "rounded-2xl border bg-background/70 p-4"
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{step.title}</div>
                        {active && <Badge>Current</Badge>}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{step.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="capitalize">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {step.tasks.map((task) => (
                          <li key={task} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg">Action plan</CardTitle>
            <p className="text-sm text-muted-foreground">What should be done across email, SMS, and LinkedIn.</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="font-medium">Pre-event</div>
              <p className="mt-2 text-muted-foreground">Invitations, registration reminders, and teaser posts.</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="font-medium">During event</div>
              <p className="mt-2 text-muted-foreground">Live updates, schedule nudges, and attendance prompts.</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="font-medium">Post-event</div>
              <p className="mt-2 text-muted-foreground">Thank-you messages, recap posts, and follow-up links.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg">Drafts</CardTitle>
          <p className="text-sm text-muted-foreground">
            One draft per platform is shown by default. Use generate new version to reveal the next version.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3 items-stretch">
            {selectedDrafts.map(({ platform, selected, drafts }) => {
              const maxVariation = drafts.length
              const currentVariation = selectedVariationByPlatform[platform] || selected.variation_num
              const generationLength = generationLengthByPlatform[platform] || "medium"
              const isSent = !!approvedDraftIds[selected.id]
              const isApproved = selected.approval_status === "approved"

              return (
                <div key={platform} className="flex h-full flex-col rounded-2xl border bg-background/70 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase tracking-wide">
                        {platformIcon(platform)}
                        <span className="ml-2">{platformLabel(platform)}</span>
                      </Badge>
                      <Badge variant="outline">
                        {currentVariation} / {maxVariation}
                      </Badge>
                    </div>
                    {isApproved && <Badge>{isSent ? "Sent" : "Approved"}</Badge>}
                  </div>

                  <div className="mt-4 min-h-0 flex-1 rounded-xl border bg-muted/20 p-4">
                    {editingId === selected.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="h-40 w-full rounded-lg border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Edit your draft..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // Save edited text (update optimistically)
                              setCampaign((prev) => {
                                if (!prev) return prev
                                return {
                                  ...prev,
                                  content: prev.content.map((c) =>
                                    c.id === selected.id ? { ...c, content_text: editedText } : c
                                  ),
                                }
                              })
                              setEditingId(null)
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="max-h-[320px] pr-3">
                        <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{selected.content_text}</pre>
                      </ScrollArea>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Generation length
                      </div>
                      <Select
                        value={generationLength}
                        onValueChange={(value) =>
                          setGenerationLengthByPlatform((state) => ({
                            ...state,
                            [platform]: value as ContentLength,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Choose length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            setWorkingPlatform(platform)
                            const currentIndex = selectedVariationByPlatform[platform] || 1
                            if (currentIndex < maxVariation) {
                              setSelectedVariationByPlatform((state) => ({
                                ...state,
                                [platform]: currentIndex + 1,
                              }))
                            } else {
                              const freshCampaign = await generateCampaign(event.id, generationLength)
                              const freshDetail = await getCampaignDetail(freshCampaign.campaign_id)
                              setCampaign(freshDetail)
                              const grouped = groupDraftsByPlatform(freshDetail.content)
                              const nextSelection: Record<string, number> = {}
                              const nextLengths: Record<string, ContentLength> = {}
                              for (const key of Object.keys(grouped)) {
                                nextSelection[key] = grouped[key][0]?.variation_num || 1
                                nextLengths[key] = generationLengthByPlatform[key] || "medium"
                              }
                              setSelectedVariationByPlatform(nextSelection)
                              setGenerationLengthByPlatform((state) => ({
                                ...nextLengths,
                                ...state,
                              }))
                              setApprovedDraftIds({})
                              setEventPublished(false)
                            }
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to generate new version")
                          } finally {
                            setWorkingPlatform(null)
                          }
                        }}
                        disabled={workingPlatform === platform}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {workingPlatform === platform ? "Generating..." : "Generate new version"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            setWorkingPlatform(platform)
                            if (selected.approval_status !== "approved") {
                              await approveContent(selected.id, defaultActor)
                            }
                            if (selected.platform === "email") {
                              await publishEmail(selected.id, DEFAULT_EMAIL_RECIPIENT, true)
                            }
                            if (selected.platform === "linkedin") {
                              await publishLinkedIn(selected.id)
                            }
                            if (selected.platform === "whatsapp") {
                              await publishWhatsApp(selected.id, resolveWhatsAppRecipient())
                            }
                            if (selected.platform === "telegram" && (integrations?.telegram?.configured ?? false)) {
                              await publishTelegram(selected.id)
                            }
                            const refreshed = await getCampaignDetail(campaign.campaign.id)
                            setCampaign(refreshed)
                            setApprovedDraftIds((state) => ({ ...state, [selected.id]: true }))
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to approve draft")
                          } finally {
                            setWorkingPlatform(null)
                          }
                        }}
                        disabled={workingPlatform === platform || isSent}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isSent ? "Sent" : selected.platform === "linkedin" ? "Approve draft" : "Send"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(selected.id)
                          setEditedText(selected.content_text)
                        }}
                        disabled={isSent}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
                    This draft is the current selected version. Later versions stay hidden until generated explicitly.
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Approved drafts can be sent later from the campaign workflow.
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/events">
                Back to Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
