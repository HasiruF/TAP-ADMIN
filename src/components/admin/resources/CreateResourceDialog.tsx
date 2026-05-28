"use client"

import { useState } from "react"
import { Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CreateResourceDialog() {
  const [type, setType] = useState<
    "youtube" | "website" | "document"
  >("youtube")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const handleCreate = () => {
    console.log({
      type,
      title,
      description,
      url,
      pdfFile,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          style={{
            backgroundColor: "var(--gold)",
            color: "black",
          }}
        >
          <Plus size={16} />
          Create Resource
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-6xl w-[50vw] p-0 overflow-hidden rounded-3xl"
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
            <div className="flex items-start justify-between gap-6">

              <div>
                <p
                  className="mb-2"
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "11px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin Panel
                </p>

                <DialogTitle
                  style={{
                    fontSize: "32px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  Create Resource
                </DialogTitle>

                <p
                  className="mt-3"
                  style={{
                    color: "var(--gold)",
                    fontSize: "14px",
                  }}
                >
                  Add learning material for artists & venues
                </p>
              </div>

              

            </div>
          </DialogHeader>
        </div>

        {/* CONTENT */}
        <div className="px-2 py-2 max-h-[70vh] overflow-y-auto">

          <div
            className="rounded-3xl border p-6 space-y-6"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >

            {/* TYPE */}
            <div className="space-y-1">
              <label className="text-sm">Resource Type</label>

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
            <div className="space-y-1">
              <label className="text-sm">Title</label>

              <Input
                className="h-12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter resource title"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <label className="text-sm">Description</label>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe this resource..."
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* URL */}
            {(type === "youtube" || type === "website") && (
              <div className="space-y-1">
                <label className="text-sm">
                  {type === "youtube"
                    ? "YouTube Link"
                    : "Website URL"}
                </label>

                <Input
                  className="h-12"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    backgroundColor: "var(--muted)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>
            )}

            {/* PDF */}
            {type === "document" && (
              <div className="space-y-1">
                <label className="text-sm">Upload PDF</label>

                <label
                  className="border rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Upload
                    size={30}
                    style={{
                      color: "var(--gold)",
                      marginBottom: "12px",
                    }}
                  />

                  <p className="text-sm">
                    {pdfFile
                      ? pdfFile.name
                      : "Click to upload PDF"}
                  </p>

                  <p
                    className="text-xs mt-2"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    PDF only (max recommended 10MB)
                  </p>

                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPdfFile(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-6">
              <Button variant="outline">
                Cancel
              </Button>

              <Button
                onClick={handleCreate}
                style={{
                  backgroundColor: "var(--gold)",
                  color: "black",
                }}
              >
                Create Resource
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}