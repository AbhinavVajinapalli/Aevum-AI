"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { Event, LifecycleStage } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: Omit<Event, "id" | "createdAt">) => void
  editingEvent?: Event | null
}

export function AddEventDialog({
  open,
  onOpenChange,
  onSubmit,
  editingEvent,
}: AddEventDialogProps) {
  const [name, setName] = useState(editingEvent?.name || "")
  const [description, setDescription] = useState(
    editingEvent?.description || ""
  )
  const [date, setDate] = useState<Date | undefined>(
    editingEvent ? new Date(editingEvent.date) : undefined
  )
  const [location, setLocation] = useState(editingEvent?.location || "")
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>(
    editingEvent?.lifecycleStage || "pre"
  )
  const [urgencyScore, setUrgencyScore] = useState(
    editingEvent?.urgencyScore?.toString() || "50"
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !date || !location) return

    onSubmit({
      name,
      description,
      date: date.toISOString(),
      location,
      lifecycleStage,
      urgencyScore: parseInt(urgencyScore, 10),
    })

    // Reset form
    setName("")
    setDescription("")
    setDate(undefined)
    setLocation("")
    setLifecycleStage("pre")
    setUrgencyScore("50")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Edit Event" : "Add New Event"}
          </DialogTitle>
          <DialogDescription>
            {editingEvent
              ? "Update the event details below."
              : "Fill in the details to create a new event for promotion."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                placeholder="Tech Conference 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Lifecycle Stage</Label>
                <Select
                  value={lifecycleStage}
                  onValueChange={(v) => setLifecycleStage(v as LifecycleStage)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre">Pre-Event</SelectItem>
                    <SelectItem value="during">During Event</SelectItem>
                    <SelectItem value="post">Post-Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="urgency">Urgency Score (0-100)</Label>
                <Input
                  id="urgency"
                  type="number"
                  min="0"
                  max="100"
                  value={urgencyScore}
                  onChange={(e) => setUrgencyScore(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingEvent ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
