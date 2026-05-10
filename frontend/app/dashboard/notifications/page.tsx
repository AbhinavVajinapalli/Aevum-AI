"use client"

import { useEffect, useState } from "react"
import {
  Sparkles,
  CheckCircle2,
  Send,
  Calendar,
  Bell,
  Check,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "campaign_generated" | "content_approved" | "post_sent" | "event_created"
  title: string
  message: string
  timestamp: string
  read: boolean
}

const notificationIcons = {
  campaign_generated: Sparkles,
  content_approved: CheckCircle2,
  post_sent: Send,
  event_created: Calendar,
}

const notificationColors = {
  campaign_generated: "text-primary bg-primary/10",
  content_approved: "text-success bg-success/10",
  post_sent: "text-chart-2 bg-chart-2/10",
  event_created: "text-chart-3 bg-chart-3/10",
}

// Mock notifications (fallback)
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "campaign_generated",
    title: "New Campaign Generated",
    message: "AI-powered content has been generated for Tech Conference 2025",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "content_approved",
    title: "Content Approved",
    message: "LinkedIn content for Product Launch has been approved",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "post_sent",
    title: "Content Published",
    message: "Email campaign for Summer Workshop has been sent successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
  },
  {
    id: "4",
    type: "event_created",
    title: "Event Created",
    message: "New event 'AI Summit 2025' has been added to the system",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: "5",
    type: "campaign_generated",
    title: "Campaign Ready",
    message: "3 content variations generated for Networking Night",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
  },
  {
    id: "6",
    type: "content_approved",
    title: "Bulk Approval",
    message: "4 content items have been approved for Brand Launch",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
  },
  {
    id: "7",
    type: "post_sent",
    title: "Multi-Platform Publish",
    message: "Content published to Email, LinkedIn, and Instagram",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "8",
    type: "event_created",
    title: "Event Updated",
    message: "Event details updated for Networking Night",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    read: true,
  },
]

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load persisted notifications from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("aevum_notifications")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setNotifications(parsed)
          return
        }
      }
    } catch (e) {
      // ignore parse errors and fall back to mock
    }
    setNotifications(mockNotifications)
  }, [])

  // Persist notifications whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem("aevum_notifications", JSON.stringify(notifications))
    } catch (e) {
      // ignore storage errors
    }
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your campaign activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleClearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {unreadCount > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                You have {unreadCount} unread notification
                {unreadCount > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                Click to mark as read
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type]
                const colorClass = notificationColors[notification.type]

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        colorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium leading-snug">
                            {notification.title}
                            {!notification.read && (
                              <Badge
                                variant="default"
                                className="ml-2 h-5 px-1.5 text-[10px]"
                              >
                                New
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have no notifications
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
