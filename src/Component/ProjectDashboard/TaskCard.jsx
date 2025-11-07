import React from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Clock, MessageSquare } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityColors = {
  low: "bg-info/10 text-info border-info/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  urgent: "bg-destructive text-destructive-foreground",
};

export function TaskCard({
  id,
  title,
  description,
  priority,
  assignee,
  storyPoints,
  comments,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 hover:shadow-md transition-shadow cursor-move group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge variant="outline" className={priorityColors[priority]}>
            {priority}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {storyPoints && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{storyPoints} pts</span>
              </div>
            )}
            {comments && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{comments}</span>
              </div>
            )}
          </div>

          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {assignee.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </Card>
  );
}
