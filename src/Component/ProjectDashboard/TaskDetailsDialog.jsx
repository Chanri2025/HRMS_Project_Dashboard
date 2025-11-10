import React from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Clock, MessageSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog.tsx";

// Keep in sync with TaskCard
const badgePriorityColors = {
  low: "bg-muted/60 text-muted-foreground border-transparent",
  medium: "bg-warning/10 text-warning border-warning/40",
  important: "bg-info/10 text-info border-info/40",
  urgent: "bg-destructive text-destructive-foreground border-destructive",
};

function formatStatus(status = "") {
  const s = status.toString().trim();
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1);
}

export function TaskDetailsDialog(props) {
  const {
    open,
    onOpenChange,
    title,
    description,
    status,
    safePriority,
    fullName,
    initials,
    dueLabel,
    storyPoints,
    comments,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6 rounded-2xl">
        <DialogHeader className="mb-2">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Title + Status */}
            <div>
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
              {status && (
                <DialogDescription className="mt-1 text-sm">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium">
                    {formatStatus(status)}
                  </span>
                </DialogDescription>
              )}
            </div>

            {/* Right: Priority pill + Close */}
            <div className="flex items-center gap-3">
              <Badge
                className={`px-4 py-1 rounded-full text-xs font-semibold capitalize ${badgePriorityColors[safePriority]}`}
              >
                {safePriority}
              </Badge>

              <DialogClose asChild>
                <button
                  className="ml-1 rounded-full p-1 hover:bg-muted/80 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-6 text-sm">
          {/* Description */}
          <div>
            <p className="font-semibold mb-1">Description</p>
            <p className="text-muted-foreground">
              {description || "No description provided."}
            </p>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold text-xs mb-2">Assignee</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{fullName}</span>
              </div>
            </div>

            <div>
              <p className="font-semibold text-xs mb-2">Due Date</p>
              <p className="text-sm text-muted-foreground">
                {dueLabel || "—"}
              </p>
            </div>
          </div>

          {/* Extra Meta */}
          {(storyPoints || comments) && (
            <div className="flex gap-8 text-xs text-muted-foreground">
              {storyPoints ? (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Story Points: {storyPoints}</span>
                </div>
              ) : null}

              {comments ? (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Comments: {comments}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
