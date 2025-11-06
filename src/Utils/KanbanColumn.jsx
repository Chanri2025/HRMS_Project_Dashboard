import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";

export function KanbanColumn({
  id,
  title,
  count,
  children,
  color = "bg-muted",
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full min-w-[320px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground">
            {title}
          </h3>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {count}
        </Badge>
      </div>

      <Card
        className={`flex-1 p-4 transition-colors ${
          isOver ? "bg-accent/50" : "bg-muted/30"
        }`}>
        <div className="space-y-3">{children}</div>
      </Card>
    </div>
  );
}
