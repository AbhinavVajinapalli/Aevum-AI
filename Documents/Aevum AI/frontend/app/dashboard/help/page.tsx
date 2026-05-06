"use client"

import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Mail,
  ExternalLink,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I create a new event?",
    answer:
      "Navigate to the Events page and click the 'Add Event' button. Fill in the event details including name, date, location, and lifecycle stage. Once created, you can generate promotional content for it.",
  },
  {
    question: "How does the AI content generation work?",
    answer:
      "Our AI analyzes your event details and generates marketing content tailored for different platforms (Email, LinkedIn, WhatsApp, Instagram). Each platform gets 3 variations to choose from, and you can edit any content before approval.",
  },
  {
    question: "Can I edit the generated content?",
    answer:
      "Yes! After selecting a content variation, you can click on the text area to edit it. Make any changes you need before approving and publishing the content.",
  },
  {
    question: "What happens after I approve content?",
    answer:
      "Approved content moves to the 'Approved' status in the Approval Panel. From there, you can click 'Send' to publish the content to your connected platforms.",
  },
  {
    question: "How do I connect my social media accounts?",
    answer:
      "Platform connections are managed through the Settings page under API Configuration. You'll need to configure your backend API endpoints that handle the actual publishing to each platform.",
  },
  {
    question: "What are urgency scores?",
    answer:
      "Urgency scores (0-100) indicate how time-sensitive an event's promotion is. Higher scores mean the event is approaching soon and needs immediate attention. This helps prioritize your content generation workflow.",
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">
          Get help with using Aevum AI
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Read the full docs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground">
                Join our community
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Get in touch with us
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions about Aevum AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started Guide</CardTitle>
          <CardDescription>
            Follow these steps to start using Aevum AI effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                1
              </div>
              <div>
                <h4 className="font-medium">Create Your First Event</h4>
                <p className="text-sm text-muted-foreground">
                  Go to the Events page and add a new event with all the
                  relevant details including name, date, location, and
                  description.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                2
              </div>
              <div>
                <h4 className="font-medium">Generate AI Content</h4>
                <p className="text-sm text-muted-foreground">
                  Click the &quot;Generate&quot; button on any event to create
                  AI-powered marketing content for Email, LinkedIn, WhatsApp,
                  and Instagram.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                3
              </div>
              <div>
                <h4 className="font-medium">Review and Edit</h4>
                <p className="text-sm text-muted-foreground">
                  Choose from 3 variations per platform, edit the content as
                  needed, and approve the final version.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                4
              </div>
              <div>
                <h4 className="font-medium">Publish Content</h4>
                <p className="text-sm text-muted-foreground">
                  Once approved, publish your content to connected platforms
                  with a single click from the Approval Panel.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                5
              </div>
              <div>
                <h4 className="font-medium">Track Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your campaigns and engagement metrics in the Analytics
                  dashboard.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/50 p-6 text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Still need help?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Our support team is here to assist you
        </p>
        <Button className="mt-4">
          <Mail className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
      </div>
    </div>
  )
}
