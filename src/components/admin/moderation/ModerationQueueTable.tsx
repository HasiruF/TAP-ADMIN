"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ModerationItem = {
  id: string
  userId: string
  name: string
  type:
    | "profile-pic"
    | "name"
    | "short-bio"
    | "long-bio"
    | "images"
    | "video"
    | "social-links"
    | "music-links"
  date: string
}

interface Props {
  data: ModerationItem[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRowClick: (item: ModerationItem) => void
}

export function ModerationQueueTable({
  data,
  onApprove,
  onReject,

  onRowClick,

}: Props) {
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredData = data.filter((item) =>
    typeFilter === "all" ? true : item.type === typeFilter
  )

  return (
    
    <div className="space-y-4">

      {/* FILTER */}
      <div className="w-[220px]">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger
            style={{
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="profile-pic">Profile Pic</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="short-bio">Short Bio</SelectItem>
            <SelectItem value="long-bio">Long Bio</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="social-links">Social Links</SelectItem>
            <SelectItem value="music-links">Music Links</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "var(--border)" }}>
            <TableHead className="text-center">User ID</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((item) => (
            <TableRow
            key={item.id}
            onClick={() => onRowClick(item)}
            className="cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            >
              {/* USER ID */}
              <TableCell
                className="text-center"
                style={{ color: "var(--muted-foreground)" }}
              >
                {item.userId}
              </TableCell>

              {/* NAME */}
              <TableCell
                className="text-center"
                style={{ color: "var(--foreground)", fontWeight: 500 }}
              >
                {item.name}
              </TableCell>

              {/* TYPE */}
              <TableCell className="text-center">
                <span
                  className="px-3 py-1 rounded-full text-xs capitalize"
                  style={{
                    backgroundColor: "rgba(201,168,76,0.1)",
                    color: "var(--gold)",
                  }}
                >
                  {item.type.replace("-", " ")}
                </span>
              </TableCell>

              {/* DATE */}
              <TableCell
                className="text-center"
                style={{ color: "var(--muted-foreground)" }}
              >
                {item.date}
              </TableCell>

              {/* ACTIONS */}
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "var(--status-active-bg)",
                      color: "var(--status-active-text)",
                    }}
                    
                    onClick={(e) => {
                      e.stopPropagation()
                      onApprove(item.id)}}
                  >
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "var(--status-banned-bg)",
                      color: "var(--status-banned-text)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onReject(item.id)}}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
    </div>
  )
}