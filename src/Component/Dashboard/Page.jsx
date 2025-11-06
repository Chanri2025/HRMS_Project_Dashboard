import React, {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {Activity, TrendingUp, Users, Target} from "lucide-react";

import {DashboardHeader} from "./DashboardHeader";
import {MetricStatCard} from "./MetricStatCard";
import {CurrentSprintCard} from "./CurrentSprintCard";
import {TeamMembersCard} from "./TeamMembersCard";

// ⬇️ import the hook so we can hoist members and reuse it
import {useDeptMembers} from "@/hooks/useDeptMembers";

const Page = () => {
    const navigate = useNavigate();

    // Auto-detect deptId + fetch members once here
    const {
        data: deptMembers,
        isLoading: membersLoading,
        isError: membersError,
        deptId: detectedDeptId,
        error: membersErrorObj,
    } = useDeptMembers();

    const memberCount = useMemo(
        () => (Array.isArray(deptMembers) ? deptMembers.length : 0),
        [deptMembers]
    );

    const metrics = useMemo(
        () => [
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
                badgeText: membersLoading ? "…" : membersError ? "Error" : "Active",
                badgeClass: `bg-info/10 text-info border-info/20`,
                value: membersLoading ? "—" : membersError ? "0" : String(memberCount),
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
        ],
        [memberCount, membersLoading, membersError]
    );

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

                {/* Reuse fetched members; prevent TeamMembersCard from fetching again */}
                <TeamMembersCard
                    members={deptMembers ?? []}
                    deptId={detectedDeptId}
                    autoFetch={false}
                />
            </div>

            {/* Optional: show fetch error inline (non-intrusive) */}
            {membersError && (
                <p className="text-xs text-destructive/80">
                    Failed to load team members{membersErrorObj?.message ? `: ${membersErrorObj.message}` : ""}.
                </p>
            )}
        </div>
    );
};

export default Page;
