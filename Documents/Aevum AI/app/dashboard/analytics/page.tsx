"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, RefreshCw, Send, Target, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getAnalytics, type BackendAnalytics } from "@/lib/backend"

const platformColors: Record<string, string> = {
  email: "hsl(var(--chart-1))",
  linkedin: "hsl(210, 100%, 40%)",
  whatsapp: "hsl(145, 70%, 50%)",
  instagram: "hsl(340, 75%, 55%)",
}

const chartConfig = {
  count: { label: "Count" },
  email: { label: "Email", color: platformColors.email },
  linkedin: { label: "LinkedIn", color: platformColors.linkedin },
  whatsapp: { label: "WhatsApp", color: platformColors.whatsapp },
  instagram: { label: "Instagram", color: platformColors.instagram },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<BackendAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      setAnalytics(await getAnalytics())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const platformData = useMemo(
    () =>
      Object.entries(analytics?.platform_breakdown || {}).map(([platform, count]) => ({
        platform,
        count,
        fill: platformColors[platform] || "hsl(var(--chart-1))",
      })),
    [analytics]
  )

  const approvalRate = analytics?.approval_rate || "0%"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Live performance metrics from the backend</p>
        </div>
        <Button variant="outline" onClick={() => { setRefreshing(true); load() }}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Events" value={analytics?.total_events ?? 0} icon={Target} description="Synced events" />
        <StatCard title="Campaigns" value={analytics?.total_campaigns ?? 0} icon={TrendingUp} description="Campaign records" />
        <StatCard title="Approved Content" value={analytics?.approved_content ?? 0} icon={CheckCircle2} description="Approved items" />
        <StatCard title="Sent Content" value={analytics?.content_sent ?? 0} icon={Send} description="Delivered posts" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={platformData} dataKey="count" nameKey="platform" innerRadius={65} outerRadius={105} paddingAngle={2}>
                  {platformData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="platform" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Counts</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px]">
              <BarChart data={platformData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="platform" type="category" tickLine={false} tickMargin={10} axisLine={false} width={90} />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="var(--color-email)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Approval Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvalRate}</div>
            <p className="text-sm text-muted-foreground">Approved vs pending content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pending Content</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.pending_content ?? 0}</div>
            <p className="text-sm text-muted-foreground">Awaiting team review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Content Sent</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.content_sent ?? 0}</div>
            <p className="text-sm text-muted-foreground">Tracked publish actions</p>
          </CardContent>
        </Card>
      </div>

      {!loading && !platformData.length && (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No analytics available yet.
        </div>
      )}
    </div>
  )
}