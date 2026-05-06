"use client"

import { Sparkles, CheckCircle2, Send, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Activity } from "@/lib/types"
import { cn } from "@/lib/utils"

const activityIcons = {
  campaign_generated: Sparkles,
  content_approved: CheckCircle2,
  post_sent: Send,
  event_created: Calendar,
}

const activityColors = {
  campaign_generated: "text-primary bg-primary/10",
  content_approved: "text-success bg-success/10",
  post_sent: "text-chart-2 bg-chart-2/10",
  event_created: "text-chart-3 bg-chart-3/10",
}

interface ActivityFeedProps {
  activities: Activity[]
  className?: string
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-6 pb-6">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="leading-snug">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}
