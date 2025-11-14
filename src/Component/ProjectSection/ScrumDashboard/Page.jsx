// src/Component/ProjectSection/ScrumDashboard/Page.jsx
import React, {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";

import {DashboardHeader} from "@/Component/Dashboard/DashboardHeader.jsx";
import {
    useScrums,
    useUsers,
    useScrumLifecycle,
} from "@/hooks/useScrums";
import {useSubProjects} from "@/hooks/useSubProjects";
import {parseCreatedOn, formatISTDateTime} from "@/Utils/Timestamp.helpers.js";
import {AddScrumModal} from "@/Component/ProjectSection/ScrumDashboard/AddScrumModal";
import ScrumDetailsModal from "@/Component/ProjectSection/ScrumDashboard/ScrumDetailsModal.jsx";

import {ScrumKpiSection} from "@/Component/ProjectSection/ScrumDashboard/ScrumKpiSection.jsx";
import {ScrumTableSection} from "@/Component/ProjectSection/ScrumDashboard/ScrumTableSection.jsx";
import {formatHoursToHM} from "@/Component/ProjectSection/ScrumDashboard/scrumUtils.js";
import {getUserCtx} from "@/lib/http";

const PRIVILEGED_ROLES = ["SUPER-ADMIN", "ADMIN", "MANAGER"];

function resolveUserMetaForPage() {
    const ctx = getUserCtx() || {};
    let baseUser = ctx?.user || ctx || {};

    let userId = baseUser?.user_id ?? baseUser?.id ?? null;
    let role = baseUser?.role ?? null;

    try {
        const raw = sessionStorage.getItem("userData");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (!userId) userId = parsed.user_id ?? parsed.id ?? null;
            if (!role) role = parsed.role ?? null;
        }
    } catch {
    }

    return {
        userId,
        role: role ? String(role).toUpperCase() : "",
    };
}

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

    // 🔐 Current user + role (with sessionStorage fallback)
    const {userId: currentUserId, role: currentRole} =
        resolveUserMetaForPage();
    const isPrivileged = PRIVILEGED_ROLES.includes(currentRole);

    // Maps for id → name/label
    const {userMap, subProjectMap} = useMemo(() => {
        const u = new Map();
        users.forEach((userRow) => {
            u.set(
                userRow.user_id,
                userRow.full_name || `User ${userRow.user_id}`
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

    // 🔎 Role-based filtering:
    //  - SUPER-ADMIN / ADMIN / MANAGER → see all scrums
    //  - Others → only their own scrums (by user_id)
    const visibleScrums = useMemo(() => {
        if (isPrivileged) return scrums;

        // Non-privileged: if we don't know who you are, you see nothing
        if (!currentUserId) return [];

        return scrums.filter(
            (s) => String(s.user_id) === String(currentUserId)
        );
    }, [scrums, isPrivileged, currentUserId]);

    // Normalize + sort scrums (latest first) based on *visible* rows
    const tableData = useMemo(() => {
        return [...visibleScrums]
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
    }, [visibleScrums, userMap, subProjectMap]);

    // KPI stats from *visible* tableData + sub-projects
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

            {/* KPI Cards with skeleton while loading */}
            <ScrumKpiSection kpis={kpis} isLoading={isLoading}/>

            {/* Table in its own section component */}
            <ScrumTableSection
                data={tableData}
                isLoading={isLoading}
                isError={isError}
                emptyText="No scrums found."
                lifecycleMutation={lifecycleMutation}
                onOpenDetails={handleOpenDetails}
                userMap={userMap}
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
