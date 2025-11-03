import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, Plus } from "lucide-react";

export function SprintHeader() {
  return (
    <div className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">Sprint 24</h2>
              <Badge variant="default" className="bg-success text-success-foreground">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Dec 1 - Dec 14, 2024</span>
              <span className="text-muted-foreground/50">•</span>
              <span>6 days remaining</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronDown className="h-4 w-4 mr-1" />
            View Options
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Create Task
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-foreground">24</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-success">12</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-info">8</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground mb-1">Story Points</p>
          <p className="text-2xl font-bold text-foreground">89</p>
        </div>
      </div>
    </div>
  );
}
