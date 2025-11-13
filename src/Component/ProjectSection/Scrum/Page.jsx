// src/Component/ProjectSection/Scrum/Page.jsx
import React, {useMemo, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {DashboardHeader} from "@/Component/Dashboard/DashboardHeader.jsx";
import {CommonTableCard} from "@/Utils/CommonTableCard";

import {
    useScrums,
    useUsers,
    useScrumLifecycle,
} from "@/hooks/useScrums";
import {useSubProjects} from "@/hooks/useSubProjects";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    PlayCircle,
    PauseCircle,
    CheckCircle2,
    Loader2,
    Activity,
    Clock,
    ListChecks,
} from "lucide-react";
import {parseCreatedOn, formatISTDateTime} from "@/Utils/Timestamp.helpers.js";
import {AddScrumModal} from "@/Component/ProjectSection/Scrum/AddScrumModal";
import ScrumDetailsModal from "@/Component/ProjectSection/Scrum/ScrumDetailsModal.jsx";

const statusClassFor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "running") {
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (s === "paused") {
        return "bg-amber-100 text-amber-900 border-amber-200";
    }
    if (s === "completed" || s === "done") {
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
    return "bg-muted text-muted-foreground border-transparent";
};

function formatHoursToHM(hours) {
    if (hours == null || Number.isNaN(hours)) return null;
    const totalMinutes = Math.round(Number(hours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
}

// Small helper to animate integers (for KPIs)
function AnimatedNumber({value, duration = 600, className = ""}) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const target = Number(value) || 0;
        if (!Number.isFinite(target)) {
            setDisplay(target);
            return;
        }

        let frame;
        let start;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min(1, (timestamp - start) / duration);
            const current = 0 + (target - 0) * progress;
            setDisplay(Math.round(current));
            if (progress < 1) {
                frame = requestAnimationFrame(step);
            }
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [value, duration]);

    return <span className={className}>{display}</span>;
}

// --- main page ---

const ScrumsPage = () => {
    const navigate = useNavigate();

    const {
        data: scrums = [],
        isLoading,
        isError,
    } = useScrums();
    const {data: users = []} = useUsers(true);
    const {subProjects} = useSubProjects();

    const lifecycleMutation = useScrumLifecycle();

    const [selectedRow, setSelectedRow] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Maps for id → name/label
    const {userMap, subProjectMap} = useMemo(() => {
        const u = new Map();
        users.forEach((user) => {
            u.set(
                user.user_id,
                user.full_name || `User ${user.user_id}`
            );
        });

        const spMap = new Map();
        subProjects.forEach((spRow) => {
            const label =
                spRow.description ||
                spRow.subprojectName ||
                "No description";
            spMap.set(spRow.id, label);
        });

        return {userMap: u, subProjectMap: spMap};
    }, [users, subProjects]);

    // Normalize + sort scrums (latest first)
    const tableData = useMemo(() => {
        return [...scrums]
            .map((s) => {
                const userName =
                    userMap.get(s.user_id) || `User ${s.user_id}`;
                const subprojectLabel =
                    subProjectMap.get(s.subproject_id) ||
                    "Sub-project";

                const created = parseCreatedOn(s.created_at);
                const lastAction = s.last_action_at
                    ? parseCreatedOn(s.last_action_at)
                    : null;

                const workHours =
                    typeof s.work_hours === "number"
                        ? s.work_hours
                        : s.work_hours
                            ? Number(s.work_hours)
                            : null;

                return {
                    ...s,
                    userName,
                    subprojectLabel,
                    created,
                    createdDisplay: created
                        ? formatISTDateTime(created)
                        : "-",
                    lastAction,
                    lastActionDisplay: lastAction
                        ? formatISTDateTime(lastAction)
                        : "-",
                    workHours,
                    workHoursDisplay: formatHoursToHM(workHours),
                    scrumStatus: s.scrum_status || null,
                };
            })
            .sort(
                (a, b) =>
                    (b.created?.getTime() || 0) -
                    (a.created?.getTime() || 0)
            );
    }, [scrums, userMap, subProjectMap]);

    // KPI stats from tableData + sub-projects
    const kpis = useMemo(() => {
        const total = tableData.length;
        let running = 0;
        let completed = 0;
        let totalHours = 0;

        tableData.forEach((row) => {
            const s = (row.scrumStatus || "").toLowerCase();
            if (s === "running") running += 1;
            if (s === "completed") completed += 1;
            if (typeof row.workHours === "number") {
                totalHours += row.workHours;
            }
        });

        const totalHoursDisplay = formatHoursToHM(totalHours) || "0 min";

        const totalSubProjects = subProjects.length;
        let completedSubs = 0;
        subProjects.forEach((sp) => {
            const st = (sp.status || sp.project_status || "").toLowerCase();
            if (st === "completed" || st === "done") {
                completedSubs += 1;
            }
        });

        const subProjectsPct = totalSubProjects
            ? Math.round((completedSubs / totalSubProjects) * 100)
            : 0;

        return {
            total,
            running,
            completed,
            totalHours,
            totalHoursDisplay,
            totalSubProjects,
            completedSubs,
            subProjectsPct,
        };
    }, [tableData, subProjects]);

    const handleOpenDetails = (row) => {
        setSelectedRow(row);
        setDetailsOpen(true);
    };

    const handleLifecycle = (row, action) => {
        if (!row?.id) return;
        lifecycleMutation.mutate({
            scrumId: row.id,
            action,
            note:
                action === "start"
                    ? "Started from dashboard"
                    : action === "pause"
                        ? "Paused from dashboard"
                        : action === "end"
                            ? "Completed from dashboard"
                            : undefined,
        });
    };

    const columns = [
        {
            key: "created_at",
            header: "Date & Time",
            render: (row) => row.createdDisplay,
        },
        {
            key: "user",
            header: "User",
            render: (row) => (
                <Badge variant="outline" className="font-normal">
                    {row.userName}
                </Badge>
            ),
        },
        {
            key: "subproject",
            header: "Sub-Project",
            render: (row) => (
                <span className="text-sm text-foreground">
                    {row.subprojectLabel}
                </span>
            ),
        },
        {
            key: "today_task",
            header: "Today Task",
            render: (row) => (
                <span className="whitespace-pre-wrap">
                    {row.today_task}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${statusClassFor(
                            row.scrumStatus
                        )}`}
                    >
                        {row.scrumStatus || "—"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                        Last: {row.lastActionDisplay}
                    </span>
                </div>
            ),
        },
        {
            key: "work_hours",
            header: "Work Hours",
            render: (row) => {
                if (!row.workHoursDisplay) {
                    return (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    );
                }
                return (
                    <span className="text-sm font-medium">
                        {row.workHoursDisplay}
                    </span>
                );
            },
        },
        {
            key: "dependencies",
            header: "Dependencies",
            render: (row) => {
                if (!row.dependencies || row.dependencies.length === 0) {
                    return (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    );
                }

                return (
                    <div className="space-y-1 text-xs">
                        {row.dependencies.map((d, idx) => {
                            const depName =
                                userMap.get(d.user_id) ||
                                `User ${d.user_id}`;
                            return (
                                <div key={idx}>
                                    <span className="font-medium">
                                        {depName}:
                                    </span>{" "}
                                    {d.description}
                                </div>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            key: "concern",
            header: "Concern",
            render: (row) => (
                <span className="whitespace-pre-wrap">
                    {row.concern || "—"}
                </span>
            ),
        },
        {
            key: "lifecycle",
            header: "State",
            render: (row) => {
                const status = (row.scrumStatus || "").toLowerCase();
                const isThisRowUpdating =
                    lifecycleMutation.isPending &&
                    lifecycleMutation.variables?.scrumId === row.id;

                const renderIcon = (Icon) =>
                    isThisRowUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <Icon className="h-5 w-5"/>
                    );

                // Completed → only a disabled check
                if (status === "completed") {
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="opacity-60"
                                title="Completed"
                            >
                                <CheckCircle2 className="h-5 w-5"/>
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        {/* Play / Pause */}
                        {status === "running" ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isThisRowUpdating}
                                onClick={() =>
                                    handleLifecycle(row, "pause")
                                }
                                title="Pause"
                            >
                                {renderIcon(PauseCircle)}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isThisRowUpdating}
                                onClick={() =>
                                    handleLifecycle(row, "start")
                                }
                                title="Start"
                            >
                                {renderIcon(PlayCircle)}
                            </Button>
                        )}

                        {/* Done */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isThisRowUpdating}
                            onClick={() => handleLifecycle(row, "end")}
                            title="Mark completed"
                        >
                            <CheckCircle2 className="h-5 w-5"/>
                        </Button>
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: "Details",
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(row)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen p-6 space-y-6">
            <DashboardHeader
                title="All Daily Scrums"
                subtitle="Team updates mapped with sub-projects, status, and work hours"
                ctaLabel="Back to Dashboard"
                onCta={() => navigate("/")}
            >
                <AddScrumModal/>
            </DashboardHeader>

            {/* KPI CARDS – pastel, gradient, hover, animated numbers */}
            {/* KPI CARDS – pastel, gradient, hover, animated numbers */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {/* Total Scrums */}
                <Card
                    className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#e2f0ff] to-[#f5f7ff]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                    <div
                        className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-blue-400/20"/>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">
                            Total Scrums
                        </CardTitle>
                        <div className="p-2 rounded-full bg-white shadow-sm">
                            <Activity className="h-5 w-5 text-blue-500"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">
                            <AnimatedNumber value={kpis.total}/>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                            All scrums in current view
                        </p>
                    </CardContent>
                </Card>

                {/* Completed Scrums */}
                <Card
                    className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#e5fff2] to-[#f3fff8]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                    <div
                        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-400/20"/>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">
                            Completed Scrums
                        </CardTitle>
                        <div className="p-2 rounded-full bg-white shadow-sm">
                            <ListChecks className="h-5 w-5 text-emerald-500"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">
                            <AnimatedNumber value={kpis.completed}/>
                        </div>
                        <p className="text-sm text-emerald-700 mt-1">
                            Marked as completed
                        </p>
                    </CardContent>
                </Card>

                {/* Completed Sub-Projects (2/7 + radial progress) */}
                <Card
                    className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#fff7da] to-[#fff3c4]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                    <div
                        className="pointer-events-none absolute -top-10 -right-4 h-24 w-24 rounded-full bg-amber-400/25"/>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900">
                            Completed Sub-Projects
                        </CardTitle>

                        {/* Radial progress */}
                        <div className="relative h-10 w-10">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `conic-gradient(#fbbf24 ${kpis.subProjectsPct * 3.6}deg, #fef3c7 0deg)`,
                                }}
                            />
                            <div
                                className="absolute inset-1 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="h-5 w-5 text-amber-500"/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1 text-2xl font-semibold text-amber-900">
                            <AnimatedNumber value={kpis.completedSubs}/>
                            <span className="text-lg text-amber-700">
                    / {kpis.totalSubProjects || 0}
                </span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                            {kpis.subProjectsPct || 0}% completed
                        </p>
                    </CardContent>
                </Card>

                {/* Total Logged Hours */}
                <Card
                    className="relative overflow-hidden border-0 rounded-2xl bg-gradient-to-r from-[#fff3ea] to-[#ffe8d6]
                   shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                    <div
                        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-orange-400/25"/>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-900">
                            Total Logged Hours
                        </CardTitle>
                        <div className="p-2 rounded-full bg-white shadow-sm">
                            <Clock className="h-5 w-5 text-orange-500"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">
                            {kpis.totalHoursDisplay}
                        </div>
                        <p className="text-sm text-orange-700 mt-1">
                            Sum of all work hours
                        </p>
                    </CardContent>
                </Card>

            </div>

            <CommonTableCard
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                isError={isError}
                emptyText="No scrums found."
            />

            <ScrumDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                row={selectedRow}
                userMap={userMap}
            />
        </div>
    );
};

export default ScrumsPage;
