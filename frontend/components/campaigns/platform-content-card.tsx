"use client"

import { useState } from "react"
import { Check, Mail, Linkedin, MessageCircle, Instagram } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Platform, ContentVariation } from "@/lib/types"

const platformIcons = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  instagram: Instagram,
}

const platformColors = {
  email: "text-chart-1 bg-chart-1/10",
  linkedin: "text-[#0A66C2] bg-[#0A66C2]/10",
  whatsapp: "text-[#25D366] bg-[#25D366]/10",
  instagram: "text-[#E4405F] bg-[#E4405F]/10",
}

const platformLabels = {
  email: "Email",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
}

interface PlatformContentCardProps {
  platform: Platform
  variations: ContentVariation[]
  onSelectVariation: (variationId: string) => void
  onUpdateContent: (variationId: string, content: string) => void
  onApprove: (variationId: string) => void
}

export function PlatformContentCard({
  platform,
  variations,
  onSelectVariation,
  onUpdateContent,
  onApprove,
}: PlatformContentCardProps) {
  const Icon = platformIcons[platform]
  const colorClass = platformColors[platform]
  const selectedVariation = variations.find((v) => v.isSelected)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            colorClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">{platformLabels[platform]}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select and customize your content
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {variations.map((variation, index) => (
            <div
              key={variation.id}
              className={cn(
                "rounded-lg border p-4 transition-all cursor-pointer",
                variation.isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:border-muted-foreground/30"
              )}
              onClick={() => onSelectVariation(variation.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>Variation {index + 1}</span>
                  {variation.isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
              {variation.isSelected ? (
                <Textarea
                  value={variation.content}
                  onChange={(e) =>
                    onUpdateContent(variation.id, e.target.value)
                  }
                  className="mt-3 min-h-[120px] resize-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="mt-2 text-sm leading-relaxed line-clamp-3">
                  {variation.content}
                </p>
              )}
              {variation.isSelected && (
                <div className="mt-3 flex justify-end">
                  {platform === "linkedin" ? (
                    <Button size="sm" disabled>
                      Coming soon
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onApprove(variation.id)
                      }}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
