"use client"

import Link from "next/link"
import { MoreHorizontal, Sparkles, Eye, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Event } from "@/lib/types"
import { cn } from "@/lib/utils"

const stageBadgeColors = {
  pre: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  during: "bg-success/10 text-success border-success/20",
  post: "bg-muted text-muted-foreground border-muted",
}

const stageLabels = {
  pre: "Pre-Event",
  during: "During",
  post: "Post-Event",
}

interface EventsTableProps {
  events: Event[]
  onGenerate: (eventId: string) => void
  onView: (eventId: string) => void
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
}

export function EventsTable({
  events,
  onGenerate,
  onView,
  onEdit,
  onDelete,
}: EventsTableProps) {
  const getUrgencyColor = (score: number) => {
    if (score >= 80) return "text-destructive"
    if (score >= 50) return "text-warning"
    return "text-success"
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-center">Urgency</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(stageBadgeColors[event.lifecycleStage])}
                >
                  {stageLabels[event.lifecycleStage]}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "font-mono font-semibold",
                    getUrgencyColor(event.urgencyScore)
                  )}
                >
                  {event.urgencyScore}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onGenerate(event.id)}
                  >
                    <Sparkles className="mr-1 h-4 w-4" />
                    Generate
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(event.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(event)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(event.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
