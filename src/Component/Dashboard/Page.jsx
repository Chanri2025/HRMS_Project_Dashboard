import React from "react";
import {useNavigate} from "react-router-dom";
import {Activity, TrendingUp, Users, Target} from "lucide-react";

import {DashboardHeader} from "./DashboardHeader";
import {MetricStatCard} from "./MetricStatCard";
import {CurrentSprintCard} from "./CurrentSprintCard";
import {TeamMembersCard} from "./TeamMembersCard";

const Page = () => {
    const navigate = useNavigate();

    const metrics = [
        {
            id: "activeTasks",
            icon: <Activity className="h-5 w-5 text-primary"/>,
            iconWrapClass: "bg-primary/10",
            badgeText: "+12%",
            badgeClass: "bg-success/10 text-success border-success/20",
            value: "24",
            label: "Active Tasks",
        },
        {
            id: "storyPoints",
            icon: <TrendingUp className="h-5 w-5 text-success"/>,
            iconWrapClass: "bg-success/10",
            badgeText: "+8%",
            badgeClass: "bg-success/10 text-success border-success/20",
            value: "89",
            label: "Story Points",
        },
        {
            id: "members",
            icon: <Users className="h-5 w-5 text-info"/>,
            iconWrapClass: "bg-info/10",
            badgeText: "Active",
            badgeClass: "bg-info/10 text-info border-info/20",
            value: "8",
            label: "Team Members",
        },
        {
            id: "completed",
            icon: <Target className="h-5 w-5 text-warning"/>,
            iconWrapClass: "bg-warning/10",
            badgeText: "50%",
            badgeClass: "bg-warning/10 text-warning border-warning/20",
            value: "12/24",
            label: "Completed",
        },
    ];

    return (
        <div className="min-h-screen p-6 space-y-6">
            {/* Header */}
            <DashboardHeader
                title="Dashboard"
                subtitle="Welcome back! Here's your sprint overview"
                ctaLabel="View Board"
                onCta={() => navigate("/board")}
            />

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <MetricStatCard
                        key={m.id}
                        icon={m.icon}
                        iconWrapClass={m.iconWrapClass}
                        badgeText={m.badgeText}
                        badgeClass={m.badgeClass}
                        value={m.value}
                        label={m.label}
                    />
                ))}
            </div>

            {/* Sprint + Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CurrentSprintCard
                    className="lg:col-span-2"
                    status="Active"
                    dateRange="Dec 1 - Dec 14, 2024"
                    remainingText="6 days remaining"
                    progress={50}
                    counts={{todo: 4, inProgress: 8, done: 12}}
                    onOpenBoard={() => navigate("/board")}
                />

                {/* Auto-fetches using dept_id + token from storage */}
                <TeamMembersCard/>
            </div>
        </div>
    );
};

export default Page;
