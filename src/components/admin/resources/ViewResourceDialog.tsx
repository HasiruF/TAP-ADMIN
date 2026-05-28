"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Resource = {
  id: string
  type: "youtube" | "website" | "document"
  title: string
  description: string
  url?: string
  fileName?: string
}

export function ViewResourceDialog({
  open,
  onOpenChange,
  resource,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  resource: Resource
}) {
  const [type, setType] = useState(resource.type)
  const [title, setTitle] = useState(resource.title)
  const [description, setDescription] = useState(resource.description)
  const [url, setUrl] = useState(resource.url || "")
  useEffect(() => {
    setType(resource.type)
    setTitle(resource.title)
    setDescription(resource.description)
    setUrl(resource.url || "")
  }, [resource])
  const getYouTubeEmbed = (url: string) => {
    const id = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    )?.[1]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }

  const embed = type === "youtube" ? getYouTubeEmbed(url) : null

  const handleSave = () => {
    console.log({
      type,
      title,
      description,
      url,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[60vw] p-0 overflow-hidden rounded-3xl"
        style={{
          backgroundColor: "var(--card)",
          color: "var(--foreground)",
          borderColor: "var(--border)",
        }}
      >

        {/* HEADER */}
        <div
          className="px-10 py-8 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontSize: "32px",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              {title}
            </DialogTitle>

            <DialogDescription>
              Add and manage learning resources for artists and venues.
          </DialogDescription>
          </DialogHeader>
        </div>

        {/* BODY */}
        <div className="px-10 py-10 grid grid-cols-2 gap-10">

          {/* LEFT - EDIT FORM */}
          <div className="space-y-8">

            {/* TYPE */}
            <div className="space-y-2">
              <label className="text-sm">Type</label>

              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger
                  className="h-12"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TITLE */}
            <div className="space-y-2">
              <label className="text-sm">Title</label>

              <Input
                className="h-12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-sm">Description</label>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* URL */}
            {(type === "youtube" || type === "website") && (
              <div className="space-y-2">
                <label className="text-sm">URL</label>

                <Input
                  className="h-12"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    backgroundColor: "var(--muted)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline">
                Close
              </Button>

              <Button
                onClick={handleSave}
                style={{
                  backgroundColor: "var(--gold)",
                  color: "black",
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* RIGHT - PREVIEW */}
          <div
            className="rounded-3xl border p-6 h-fit"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >

            <p className="text-xs mb-4 text-muted-foreground uppercase tracking-widest">
              Live Preview
            </p>

            {/* YOUTUBE */}
            {type === "youtube" && embed && (
              <div
                className="rounded-2xl overflow-hidden border"
                style={{ aspectRatio: "16/9" }}
              >
                <iframe
                  src={embed}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* WEBSITE */}
            {type === "website" && (
              <a
                href={url}
                target="_blank"
                className="text-sm underline"
                style={{ color: "var(--foreground)" }}
              >
                Open Website →
              </a>
            )}

            {/* PDF */}
            {type === "document" && (
              <div
                className="p-6 rounded-2xl border text-center"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-sm">PDF Document</p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {resource.fileName || "No file uploaded"}
                </p>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}