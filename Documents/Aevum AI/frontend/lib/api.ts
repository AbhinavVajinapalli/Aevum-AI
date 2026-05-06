import type {
  Event,
  Campaign,
  DashboardStats,
  Activity,
  AnalyticsData,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

// Events API
export async function getEvents(): Promise<Event[]> {
  return fetchApi<Event[]>("/events")
}

export async function createEvent(
  event: Omit<Event, "id" | "createdAt">
): Promise<Event> {
  return fetchApi<Event>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  })
}

export async function getEvent(id: string): Promise<Event> {
  return fetchApi<Event>(`/events/${id}`)
}

// Campaigns API
export async function generateCampaign(eventId: string): Promise<Campaign> {
  return fetchApi<Campaign>(`/generate/${eventId}`, {
    method: "POST",
  })
}

export async function getCampaigns(): Promise<Campaign[]> {
  return fetchApi<Campaign[]>("/campaigns")
}

export async function getCampaign(id: string): Promise<Campaign> {
  return fetchApi<Campaign>(`/campaigns/${id}`)
}

export async function approveCampaign(
  campaignId: string,
  platformSelections: { platform: string; variationId: string }[]
): Promise<Campaign> {
  return fetchApi<Campaign>("/approve", {
    method: "POST",
    body: JSON.stringify({ campaignId, platformSelections }),
  })
}

export async function sendCampaign(campaignId: string): Promise<Campaign> {
  return fetchApi<Campaign>("/send", {
    method: "POST",
    body: JSON.stringify({ campaignId }),
  })
}

// Dashboard API
export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>("/dashboard/stats")
}

export async function getRecentActivity(): Promise<Activity[]> {
  return fetchApi<Activity[]>("/dashboard/activity")
}

// Analytics API
export async function getAnalytics(): Promise<AnalyticsData> {
  return fetchApi<AnalyticsData>("/analytics")
}
