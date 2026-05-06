"use client"

import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Event } from "@/lib/types"
import { cn } from "@/lib/utils"

const stageBadgeColors = {
  pre: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  during: "bg-success/10 text-success border-success/20",
  post: "bg-muted text-muted-foreground border-muted",
}

const stageLabels = {
  pre: "Upcoming",
  during: "Live",
  post: "Completed",
}

interface UpcomingEventsProps {
  events: Event[]
  className?: string
}

export function UpcomingEvents({ events, className }: UpcomingEventsProps) {
  const upcomingEvents = events
    .filter((e) => e.lifecycleStage !== "post")
    .slice(0, 5)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/events">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-6 pb-6">
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-lg font-bold leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium leading-snug">{event.name}</h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0",
                        stageBadgeColors[event.lifecycleStage]
                      )}
                    >
                      {stageLabels[event.lifecycleStage]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No upcoming events
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
