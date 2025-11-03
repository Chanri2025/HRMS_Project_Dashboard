import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, TrendingUp, Users, Target, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your sprint overview</p>
        </div>
        <Button onClick={() => navigate("/board")}>
          View Board
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              +12%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">24</h3>
          <p className="text-sm text-muted-foreground">Active Tasks</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              +8%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">89</h3>
          <p className="text-sm text-muted-foreground">Story Points</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-info/10 rounded-lg">
              <Users className="h-5 w-5 text-info" />
            </div>
            <Badge variant="outline" className="bg-info/10 text-info border-info/20">
              Active
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">8</h3>
          <p className="text-sm text-muted-foreground">Team Members</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              50%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">12/24</h3>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>
      </div>

      {/* Sprint Info & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Sprint */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Current Sprint</h2>
            <Badge className="bg-success text-success-foreground">Active</Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Dec 1 - Dec 14, 2024</span>
              <span>•</span>
              <span className="text-sm">6 days remaining</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">50%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary rounded-full h-2 transition-all" style={{ width: '50%' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">To Do</p>
                <p className="text-lg font-semibold text-foreground">4</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                <p className="text-lg font-semibold text-info">8</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Done</p>
                <p className="text-lg font-semibold text-success">12</p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/board")}>
              Go to Sprint Board
            </Button>
          </div>
        </Card>

        {/* Team Members */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Team Members</h2>
          <div className="space-y-3">
            {[
              { name: "Alex Chen", role: "Frontend Dev", initials: "AC" },
              { name: "Jordan Lee", role: "UI Designer", initials: "JL" },
              { name: "Morgan Park", role: "Backend Dev", initials: "MP" },
              { name: "Sam Wilson", role: "QA Engineer", initials: "SW" },
              { name: "Taylor Kim", role: "Tech Lead", initials: "TK" },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
