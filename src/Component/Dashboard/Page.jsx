// src/Component/Dashboard/Page.jsx
import React, {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {
    FolderKanban,
    ListChecks,
    Users,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";

import {MetricStatCard} from "./MetricStatCard";
import {CurrentSprintCard} from "./CurrentSprintCard";
import {TeamMembersCard} from "./TeamMembersCard";
import {MetricStatCardSkeleton} from "@/Component/Dashboard/SkeletonLoading/MetricStatCardSkeleton";

import {useDeptMembers} from "@/hooks/useDeptMembers";
import {useActiveProjects} from "@/hooks/useActiveProjects";
import {useSubProjects} from "@/hooks/useSubProjects";
import {useScrums} from "@/hooks/useScrums";
import {useMe} from "@/hooks/useMe";

import {DashboardHeader} from "./DashboardHeader";
import {AddScrumModal} from "@/Component/ProjectSection/ScrumDashboard/AddScrumModal";

// role helper + button
import {getCurrentRole} from "@/Utils/navigation";
import {Button} from "@/components/ui/button";

// date helpers
import {
    parseCreatedOn,
    formatRange,
    calcDaysRemaining,
} from "@/Utils/Timestamp.helpers.js";

const Page = () => {
    const navigate = useNavigate();

    // ---------- Me ----------
    const {data: me} = useMe(true);
    const currentUserId = me?.user_id;

    // ---------- Role-based flags ----------
    const role = getCurrentRole(); // SUPER-ADMIN / ADMIN / MANAGER / EMPLOYEE / USER
    const canViewScrum = ["SUPER-ADMIN", "ADMIN", "MANAGER"].includes(role);
    const isPrivileged = canViewScrum; // same roles

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

    // ---------- Build sprint info from sub-project statuses ----------
    const sprintInfo = useMemo(() => {
        const list = Array.isArray(subProjects) ? subProjects : [];
        if (list.length === 0) {
            return {
                status: "Planned",
                dateRange: null,
                remainingText: null,
                progress: 0,
                counts: {todo: 0, inProgress: 0, done: 0},
            };
        }

        let todo = 0;
        let inProgress = 0;
        let done = 0;

        let startDate = null;
        let endCandidate = null;

        list.forEach((sp) => {
            const raw =
                (sp.status ||
                    sp.project_status ||
                    sp.projectStatus ||
                    "") + "";
            const s = raw.toLowerCase().trim();

            if (
                s === "completed" ||
                s === "done" ||
                s === "deployment" ||
                s === "deployed"
            ) {
                done += 1;
            } else if (
                s === "in progress" ||
                s === "in-progress" ||
                s === "development" ||
                s === "active"
            ) {
                inProgress += 1;
            } else {
                todo += 1;
            }

            const created =
                parseCreatedOn(
                    sp.created_on ||
                    sp.createdOn ||
                    sp.createdAt
                ) || null;

            const deadline =
                parseCreatedOn(
                    sp.subproject_deadline || sp.deadline
                ) || null;

            const last =
                parseCreatedOn(
                    sp.last_modified ||
                    sp.updatedAt
                ) || null;

            if (created) {
                if (!startDate || created < startDate) {
                    startDate = created;
                }
            }

            const candidate = deadline || last;
            if (candidate) {
                if (!endCandidate || candidate > endCandidate) {
                    endCandidate = candidate;
                }
            }
        });

        const total = todo + inProgress + done;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        let status = "Planned";
        if (total === 0) {
            status = "Planned";
        } else if (progress === 100) {
            status = "Completed";
        } else {
            status = "Active";
        }

        const dateRange =
            startDate && endCandidate
                ? formatRange(startDate, endCandidate)
                : null;

        let remainingText = null;
        if (endCandidate && status !== "Completed") {
            const remaining = calcDaysRemaining(endCandidate);
            if (remaining > 1) {
                remainingText = `${remaining} days remaining`;
            } else if (remaining === 1) {
                remainingText = "1 day remaining";
            } else {
                remainingText = "Sprint end date reached";
            }
        }

        return {
            status,
            dateRange,
            remainingText,
            progress,
            counts: {todo, inProgress, done},
        };
    }, [subProjects]);

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

    // ---------- Scrums (role-aware via hook) ----------
    const {
        data: scrums = [],
        isLoading: scrumsLoading,
        isError: scrumsError,
    } = useScrums();

    // For privileged roles → total scrums; others → only own scrums
    const scrumCount = useMemo(() => {
        if (!Array.isArray(scrums)) return 0;

        if (isPrivileged) {
            return scrums.length;
        }

        if (!currentUserId) return 0;
        return scrums.filter(
            (s) => String(s.user_id) === String(currentUserId)
        ).length;
    }, [scrums, currentUserId, isPrivileged]);

    // ---------- Metrics ----------
    const metrics = useMemo(
        () => [
            {
                id: "activeProjects",
                loading: projectsLoading,
                icon: <FolderKanban className="h-5 w-5 text-sky-600"/>,
                iconWrapClass: "bg-sky-100 rounded-full",
                badgeText: projectsLoading
                    ? "Loading"
                    : projectsError
                        ? "Error"
                        : "Live",
                badgeClass: projectsError
                    ? "bg-rose-100 text-rose-600 border-rose-200"
                    : "bg-sky-50 text-sky-700 border-sky-200",
                value: projectsLoading
                    ? "—"
                    : projectsError
                        ? "0"
                        : String(activeCount || 0),
                label: "Active Projects",
            },
            {
                id: "myScrums",
                loading: scrumsLoading || (!isPrivileged && !currentUserId),
                icon: <ListChecks className="h-5 w-5 text-violet-600"/>,
                iconWrapClass: "bg-violet-100 rounded-full",
                badgeText: scrumsLoading
                    ? "Loading"
                    : scrumsError
                        ? "Error"
                        : "Total",
                badgeClass: scrumsError
                    ? "bg-rose-100 text-rose-600 border-rose-200"
                    : "bg-violet-50 text-violet-700 border-violet-200",
                value:
                    scrumsLoading || (!isPrivileged && !currentUserId)
                        ? "—"
                        : scrumsError
                            ? "0"
                            : String(scrumCount || 0),
                label: isPrivileged ? "All Scrums" : "My Scrums",
            },
            {
                id: "members",
                loading: membersLoading,
                icon: <Users className="h-5 w-5 text-emerald-600"/>,
                iconWrapClass: "bg-emerald-100 rounded-full",
                badgeText: membersLoading
                    ? "Loading"
                    : membersError
                        ? "Error"
                        : "Active",
                badgeClass: membersError
                    ? "bg-rose-100 text-rose-600 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200",
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
                icon: <CheckCircle2 className="h-5 w-5 text-amber-600"/>,
                iconWrapClass: "bg-amber-100 rounded-full",
                badgeText: subsLoading
                    ? "Loading"
                    : subsError
                        ? "Error"
                        : `${completionPercent}%`,
                badgeClass: subsError
                    ? "bg-rose-100 text-rose-600 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
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
            scrumsLoading,
            scrumsError,
            scrumCount,
            isPrivileged,
            currentUserId,
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
                {canViewScrum ? (
                    <Button
                        type="button"
                        onClick={() => navigate("/project/scrum")}
                        className="
                            flex items-center gap-2 px-5 py-2 font-medium text-sm
                            bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500
                            text-white rounded-m shadow-sm
                            transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
                            hover:from-sky-600 hover:via-indigo-600 hover:to-violet-600
                            active:scale-[0.98]
                        "
                    >
                        View Scrum
                        <ArrowRight className="h-4 w-4"/>
                    </Button>
                ) : (
                    <AddScrumModal/>
                )}
            </DashboardHeader>

            {/* Metric cards */}
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
                            variant={
                                m.id === "activeProjects"
                                    ? "blue"
                                    : m.id === "myScrums"
                                        ? "violet"
                                        : m.id === "members"
                                            ? "green"
                                            : m.id === "completedSubProjects"
                                                ? "amber"
                                                : "default"
                            }
                        />
                    )
                )}
            </div>

            {/* Sprint + Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CurrentSprintCard
                    className="lg:col-span-2"
                    status={sprintInfo.status}
                    dateRange={sprintInfo.dateRange}
                    remainingText={sprintInfo.remainingText}
                    progress={sprintInfo.progress}
                    counts={sprintInfo.counts}
                    onOpenBoard={() => navigate("/board")}
                />

                <TeamMembersCard
                    members={deptMembers ?? []}
                    deptId={detectedDeptId}
                    autoFetch={false}
                />
            </div>

            {/* Non-intrusive errors */}
            {membersError && (
                <p className="text-xs text-destructive/80">
                    Failed to load team members
                    {membersErrorObj?.message
                        ? `: ${membersErrorObj.message}`
                        : ""}
                </p>
            )}
            {projectsError && (
                <p className="text-xs text-destructive/80">
                    Failed to load projects
                    {projectsErrorObj?.message
                        ? `: ${projectsErrorObj.message}`
                        : ""}
                </p>
            )}
            {subsError && (
                <p className="text-xs text-destructive/80">
                    Failed to load sub-projects
                    {subsErrorObj?.message
                        ? `: ${subsErrorObj.message}`
                        : ""}
                </p>
            )}
        </div>
    );
};

export default Page;
