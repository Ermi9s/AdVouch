"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ExternalLink, Code, Image, FileJson } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdExportModalProps {
  adId: string
  adTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdExportModal({ adId, adTitle, open, onOpenChange }: AdExportModalProps) {
  const [embedCode, setEmbedCode] = useState<string>("")
  const [directLink, setDirectLink] = useState<string>("")
  const [embedUrl, setEmbedUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open && adId) {
      fetchEmbedCode()
    }
  }, [open, adId])

  const fetchEmbedCode = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_RESOURCE_API_URL}/api/v1/ads/${adId}/embed-code/`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch embed code")
      }

      const data = await response.json()
      setEmbedCode(data.iframe_code || "")
      setDirectLink(data.direct_link || "")
      setEmbedUrl(data.embed_url || "")
    } catch (error) {
      console.error("Error fetching embed code:", error)
      toast({
        title: "Error",
        description: "Failed to generate embed code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(label)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const openPreview = () => {
    if (embedUrl) {
      window.open(embedUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Export Ad: {adTitle}
          </DialogTitle>
          <DialogDescription>
            Export your ad with AdVouch branding for external advertising platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AdVouch Branding Notice */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                A
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">AdVouch Verified</h4>
                <p className="text-xs text-muted-foreground">
                  All exported ads include "Advertised via AdVouch" branding to build trust and credibility with your audience.
                </p>
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Generating export code...</p>
            </div>
          ) : (
            <Tabs defaultValue="embed" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="embed">
                  <Code className="h-4 w-4 mr-2" />
                  Embed Code
                </TabsTrigger>
                <TabsTrigger value="link">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Direct Link
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Image className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* Embed Code Tab */}
              <TabsContent value="embed" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">iFrame Embed Code</label>
                    <Badge variant="outline">Recommended</Badge>
                  </div>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(embedCode, "Embed code")}
                    >
                      {copiedItem === "Embed code" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Copy and paste this code into your website or platform to embed the ad with AdVouch branding.
                  </p>
                </div>
              </TabsContent>

              {/* Direct Link Tab */}
              <TabsContent value="link" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">HTML Link Code</label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border">
                      <code>{directLink}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(directLink, "Direct link")}
                    >
                      {copiedItem === "Direct link" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use this HTML link to direct users to the ad on AdVouch.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Plain URL</label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border">
                      <code>{embedUrl}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(embedUrl, "URL")}
                    >
                      {copiedItem === "URL" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-4">
                    Preview how your ad will appear when embedded on external platforms with AdVouch branding.
                  </p>
                  <Button onClick={openPreview} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Preview in New Tab
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">What's included:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>"Advertised via AdVouch" badge in the top-right corner</li>
                    <li>AdVouch branding in the footer</li>
                    <li>Verified & Trusted indicator</li>
                    <li>Responsive design for all devices</li>
                    <li>Professional styling with your ad content</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={openPreview} disabled={!embedUrl}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

