"use client"

import { useState } from "react"
import {
  Check,
  X,
  Send,
  Pencil,
  ChevronDown,
  ChevronUp,
  Mail,
  Linkedin,
  MessageCircle,
  Instagram,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Campaign, CampaignStatus, Platform } from "@/lib/types"

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-success/10 text-success border-success/20",
  sent: "bg-chart-1/10 text-chart-1 border-chart-1/20",
}

const platformIcons = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  instagram: Instagram,
}

const platformLabels = {
  email: "Email",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
}

interface ApprovalCardProps {
  campaign: Campaign
  onApprove: (campaignId: string) => void
  onReject: (campaignId: string) => void
  onSend: (campaignId: string) => void
  onEditContent: (campaignId: string, platform: Platform, content: string) => void
}

export function ApprovalCard({
  campaign,
  onApprove,
  onReject,
  onSend,
  onEditContent,
}: ApprovalCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleStartEdit = (platform: Platform, content: string) => {
    setEditingPlatform(platform)
    setEditContent(content)
  }

  const handleSaveEdit = () => {
    if (editingPlatform) {
      onEditContent(campaign.id, editingPlatform, editContent)
      setEditingPlatform(null)
      setEditContent("")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{campaign.eventName}</h3>
              <Badge
                variant="outline"
                className={cn("capitalize", statusColors[campaign.status])}
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Created{" "}
              {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {campaign.status === "draft" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(campaign.id)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button size="sm" onClick={() => onApprove(campaign.id)}>
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            {campaign.status === "approved" && (
              <Button size="sm" onClick={() => onSend(campaign.id)}>
                <Send className="mr-1 h-4 w-4" />
                Send
              </Button>
            )}
            {campaign.status === "sent" && (
              <Badge variant="outline" className="bg-success/10 text-success">
                <Check className="mr-1 h-3 w-3" />
                Published
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {campaign.platforms.length} platforms
                </span>
                <div className="flex items-center gap-1">
                  {campaign.platforms.map((p) => {
                    const Icon = platformIcons[p.platform]
                    return (
                      <div
                        key={p.platform}
                        className="flex h-6 w-6 items-center justify-center rounded bg-muted"
                      >
                        <Icon className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )
                  })}
                </div>
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            {campaign.platforms.map((platformContent) => {
              const Icon = platformIcons[platformContent.platform]
              const selectedVariation = platformContent.variations.find(
                (v) => v.isSelected
              )
              const content = selectedVariation?.content || "Content not available"
              const isEditing = editingPlatform === platformContent.platform

              return (
                <div
                  key={platformContent.platform}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {platformLabels[platformContent.platform]}
                      </span>
                    </div>
                    {campaign.status === "draft" && !isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStartEdit(platformContent.platform, content)
                        }
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPlatform(null)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {content}
                    </p>
                  )}
                </div>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
