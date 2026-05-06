"use client"

import { useEffect, useState } from "react"
import { Key, Globe, Mail, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIntegrationsStatus, type IntegrationStatus } from "@/lib/backend"

function statusBadge(mode: string) {
  if (mode === "live") return "bg-success/10 text-success border-success/20"
  return "bg-muted text-muted-foreground"
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getIntegrationsStatus()
      .then(setIntegrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load status"))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Integration readiness and production configuration</p>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { key: "calendar", icon: CalendarDays, label: "Calendar" },
          { key: "gemini", icon: Key, label: "Gemini" },
          { key: "smtp", icon: Mail, label: "SMTP" },
          { key: "linkedin", icon: Globe, label: "LinkedIn" },
        ].map((item) => {
          const mode = integrations?.[item.key as keyof IntegrationStatus]?.mode || "unknown"
          const configured = integrations?.[item.key as keyof IntegrationStatus]?.configured ? "configured" : "missing"
          const Icon = item.icon
          return (
            <Card key={item.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusBadge(mode)}>{mode}</Badge>
                  <span className="text-xs text-muted-foreground">{configured}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mode === "live"
                    ? "Connected and ready for production use."
                    : "Missing credentials. Set the required environment variables and restart the backend."}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div><code>GOOGLE_CREDENTIALS_PATH</code> and <code>GOOGLE_CALENDAR_ID</code></div>
          <div><code>GEMINI_API_KEY</code></div>
          <div><code>SMTP_USERNAME</code> and <code>SMTP_PASSWORD</code></div>
          <div><code>LINKEDIN_ACCESS_TOKEN</code></div>
          <div><code>ALLOW_DEMO_MODE=False</code></div>
        </CardContent>
      </Card>
    </div>
  )
}