import React, {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {Activity, TrendingUp, Users, Target} from "lucide-react";

import {MetricStatCard} from "./MetricStatCard";
import {CurrentSprintCard} from "./CurrentSprintCard";
import {TeamMembersCard} from "./TeamMembersCard";
import {MetricStatCardSkeleton} from "@/Component/Dashboard/SkeletonLoading/MetricStatCardSkeleton";

import {useDeptMembers} from "@/hooks/useDeptMembers";
import {useActiveProjects} from "@/hooks/useActiveProjects";
import {useSubProjects} from "@/hooks/useSubProjects";

import {DashboardHeader} from "./DashboardHeader";
import {AddScrumModal} from "@/Component/ProjectSection/Scrum/AddScrumModal";

const Page = () => {
    const navigate = useNavigate();

    // ---------- Dept members ----------
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

    // ---------- Active projects ----------
    const {
        activeCount,
        isLoading: projectsLoading,
        isError: projectsError,
        error: projectsErrorObj,
    } = useActiveProjects();

    // ---------- Sub-projects ----------
    const {
        subProjects,
        isLoading: subsLoading,
        isError: subsError,
        error: subsErrorObj,
    } = useSubProjects();

    const {
        totalSubProjects,
        completedSubProjectsCount,
        completionPercent,
    } = useMemo(() => {
        const list = Array.isArray(subProjects) ? subProjects : [];
        const total = list.length;
        const completed = list.filter((sp) => {
            const raw =
                (sp.status ||
                    sp.project_status ||
                    sp.projectStatus ||
                    "") + "";
            const s = raw.toLowerCase().trim();
            return (
                s === "completed" ||
                s === "done" ||
                s === "deployment" ||
                s === "deployed"
            );
        }).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
            totalSubProjects: total,
            completedSubProjectsCount: completed,
            completionPercent: pct,
        };
    }, [subProjects]);

    // ---------- Metrics ----------
    const metrics = useMemo(
        () => [
            {
                id: "activeProjects",
                loading: projectsLoading,
                icon: <Activity className="h-5 w-5 text-primary"/>,
                iconWrapClass: "bg-primary/10",
                badgeText: projectsLoading
                    ? "Loading"
                    : projectsError
                        ? "Error"
                        : "Live",
                badgeClass: projectsError
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-primary/5 text-primary border-primary/20",
                value: projectsLoading
                    ? "—"
                    : projectsError
                        ? "0"
                        : String(activeCount || 0),
                label: "Active Projects",
            },
            {
                id: "storyPoints",
                loading: false,
                icon: <TrendingUp className="h-5 w-5 text-success"/>,
                iconWrapClass: "bg-success/10",
                badgeText: "+8%",
                badgeClass: "bg-success/10 text-success border-success/20",
                value: "89",
                label: "Story Points",
            },
            {
                id: "members",
                loading: membersLoading,
                icon: <Users className="h-5 w-5 text-info"/>,
                iconWrapClass: "bg-info/10",
                badgeText: membersLoading
                    ? "Loading"
                    : membersError
                        ? "Error"
                        : "Active",
                badgeClass: "bg-info/10 text-info border-info/20",
                value: membersLoading
                    ? "—"
                    : membersError
                        ? "0"
                        : String(memberCount || 0),
                label: "Team Members",
            },
            {
                id: "completedSubProjects",
                loading: subsLoading,
                icon: <Target className="h-5 w-5 text-warning"/>,
                iconWrapClass: "bg-warning/10",
                badgeText: subsLoading
                    ? "Loading"
                    : subsError
                        ? "Error"
                        : `${completionPercent}%`,
                badgeClass: subsError
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-warning/10 text-warning border-warning/20",
                value: subsLoading
                    ? "—"
                    : subsError
                        ? "0"
                        : `${completedSubProjectsCount}/${totalSubProjects || 0}`,
                label: "Completed Sub-Projects",
            },
        ],
        [
            activeCount,
            projectsLoading,
            projectsError,
            memberCount,
            membersLoading,
            membersError,
            subsLoading,
            subsError,
            completionPercent,
            completedSubProjectsCount,
            totalSubProjects,
        ]
    );
    return (
        <div className="min-h-screen p-6 space-y-6">
            <DashboardHeader
                title="Dashboard"
                subtitle="Welcome back! Here's your sprint overview"
                ctaLabel="View Projects Page"
                onCta={() => navigate("/board")}
            >
                <AddScrumModal/>
            </DashboardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) =>
                    m.loading ? (
                        <MetricStatCardSkeleton key={m.id}/>
                    ) : (
                        <MetricStatCard
                            key={m.id}
                            icon={m.icon}
                            iconWrapClass={m.iconWrapClass}
                            badgeText={m.badgeText}
                            badgeClass={m.badgeClass}
                            value={m.value}
                            label={m.label}
                        />
                    )
                )}
            </div>

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

                <TeamMembersCard
                    members={deptMembers ?? []}
                    deptId={detectedDeptId}
                    autoFetch={false}
                />
            </div>

            {membersError && (
                <p className="text-xs text-destructive/80">
                    Failed to load team members
                    {membersErrorObj?.message ? `: ${membersErrorObj.message}` : ""}.
                </p>
            )}
            {projectsError && (
                <p className="text-xs text-destructive/80">
                    Failed to load projects
                    {projectsErrorObj?.message ? `: ${projectsErrorObj.message}` : ""}.
                </p>
            )}
            {subsError && (
                <p className="text-xs text-destructive/80">
                    Failed to load sub-projects
                    {subsErrorObj?.message ? `: ${subsErrorObj.message}` : ""}.
                </p>
            )}
        </div>
    );
};

export default Page;
