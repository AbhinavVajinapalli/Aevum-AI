const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

async function requestApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `API Error: ${response.status} ${response.statusText}`
    try {
      const errorBody = await response.json()
      message = errorBody?.detail || errorBody?.message || message
    } catch {
      // Ignore JSON parsing errors and fall back to the status text.
    }
    throw new Error(message)
  }

  return response.json()
}

export type BackendEvent = {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  event_type: string
  lifecycle_stage: "pre_event" | "during_event" | "post_event"
  urgency_score: number
  synced_at?: string
  created_at?: string
}

export type BackendCampaignSummary = {
  id: string
  event_id: string
  stage: string
  status: string
  metadata?: string
  created_at: string
  updated_at: string
  event_name: string
  lifecycle_stage: string
  content_count: number
  status_breakdown: Record<string, number>
}

export type BackendContentItem = {
  id: string
  campaign_id: string
  platform: string
  content_text: string
  variation_num: number
  tone?: string
  hashtags?: string
  scheduled_time?: string
  status: string
  approval_status: string
  created_at?: string
  updated_at?: string
  event_id?: string
  event_title?: string
}

export type BackendCampaignDetail = {
  campaign: BackendCampaignSummary
  content: BackendContentItem[]
  total_variations: number
}

export type BackendAnalytics = {
  total_events: number
  total_campaigns: number
  approved_content: number
  pending_content: number
  content_sent: number
  approval_rate: string
  platform_breakdown: Record<string, number>
}

export type IntegrationStatus = {
  linkedin: { configured: boolean; mode: string }
  smtp: { configured: boolean; mode: string }
  gemini: { configured: boolean; mode: string }
  calendar: { configured: boolean; mode: string }
}

export type DashboardSnapshot = {
  analytics: BackendAnalytics
  events: BackendEvent[]
  campaigns: BackendCampaignSummary[]
  pendingApprovals: BackendContentItem[]
  integrations: IntegrationStatus
}

export async function getEvents(limit = 10): Promise<BackendEvent[]> {
  return requestApi<BackendEvent[]>(`/events?limit=${limit}`)
}

export async function getEventDetail(eventId: string): Promise<BackendEvent> {
  return requestApi<BackendEvent>(`/events/${encodeURIComponent(eventId)}`)
}

export async function generateCampaign(eventId: string) {
  return requestApi<{ status: string; campaign_id: string; content_ids: string[] }>(
    `/campaigns/generate?event_id=${encodeURIComponent(eventId)}`,
    { method: "POST" }
  )
}

export async function getCampaigns(limit = 10): Promise<BackendCampaignSummary[]> {
  const response = await requestApi<{ total_campaigns: number; campaigns: BackendCampaignSummary[] }>(
    `/campaigns?limit=${limit}`
  )
  return response.campaigns
}

export async function getCampaignDetail(campaignId: string): Promise<BackendCampaignDetail> {
  return requestApi<BackendCampaignDetail>(`/campaigns/${encodeURIComponent(campaignId)}`)
}

export async function getPendingApprovals(limit = 20): Promise<BackendContentItem[]> {
  const response = await requestApi<{ total_pending: number; items: BackendContentItem[] }>(
    `/approvals/pending?limit=${limit}`
  )
  return response.items
}

export async function approveContent(contentId: string, approvedBy = "dashboard-user") {
  return requestApi(`/approvals?content_id=${encodeURIComponent(contentId)}&approved_by=${encodeURIComponent(approvedBy)}`, {
    method: "POST",
  })
}

export async function bulkApproveContent(contentIds: string[], approvedBy = "dashboard-user") {
  return requestApi(`/approvals/bulk-approve?approved_by=${encodeURIComponent(approvedBy)}`, {
    method: "POST",
    body: JSON.stringify(contentIds),
  })
}

export async function rejectContent(contentId: string, reason = "Rejected via dashboard") {
  return requestApi(
    `/approvals/${encodeURIComponent(contentId)}/reject?reason=${encodeURIComponent(reason)}`,
    { method: "POST" }
  )
}

export async function publishEmail(
  contentId: string,
  recipient = process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_EMAIL || "test@example.com",
  useHtml = true,
) {
  return requestApi(
    `/content/${encodeURIComponent(contentId)}/publish/email?recipient=${encodeURIComponent(recipient)}&use_html=${useHtml ? "true" : "false"}`,
    { method: "POST" }
  )
}

export async function publishLinkedIn(contentId: string) {
  return requestApi(`/content/${encodeURIComponent(contentId)}/publish/linkedin`, {
    method: "POST",
  })
}

export async function getAnalytics(): Promise<BackendAnalytics> {
  return requestApi<BackendAnalytics>("/analytics")
}

export async function getIntegrationsStatus(): Promise<IntegrationStatus> {
  return requestApi<IntegrationStatus>("/integrations/status")
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [analytics, events, campaigns, pendingApprovals, integrations] = await Promise.all([
    getAnalytics(),
    getEvents(5),
    getCampaigns(5),
    getPendingApprovals(8),
    getIntegrationsStatus(),
  ])

  return {
    analytics,
    events,
    campaigns,
    pendingApprovals,
    integrations,
  }
}
