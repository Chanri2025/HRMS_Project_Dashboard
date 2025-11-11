import React, {useMemo} from "react";
import {useNavigate} from "react-router-dom";

import {DashboardHeader} from "@/Component/Dashboard/DashboardHeader.jsx";
import {CommonTableCard} from "@/Utils/CommonTableCard";

import {useScrums, useUsers} from "@/hooks/useScrums";
import {useSubProjects} from "@/hooks/useSubProjects";
import {Badge} from "@/components/ui/badge";
import {AddScrumModal} from "@/Component/ProjectSection/Scrum/AddScrumModal";
import {parseCreatedOn, formatISTDateTime} from "@/Utils/ProjectHeader.helpers.js";

const ScrumsPage = () => {
    const navigate = useNavigate();

    const {
        data: scrums = [],
        isLoading,
        isError,
    } = useScrums();
    const {data: users = []} = useUsers(true);
    const {subProjects} = useSubProjects();

    // Maps for id → name/label
    const {userMap, subProjectMap} = useMemo(() => {
        const u = new Map();
        users.forEach((user) => {
            u.set(user.user_id, user.full_name || `User ${user.user_id}`);
        });

        const sp = new Map();
        subProjects.forEach((spRow) => {
            const label =
                spRow.description ||
                spRow.subprojectName ||
                "No description";
            sp.set(spRow.id, label);
        });

        return {userMap: u, subProjectMap: sp};
    }, [users, subProjects]);

    // Normalize + sort scrums (latest first) using parseCreatedOn for IST
    const tableData = useMemo(() => {
        return [...scrums]
            .map((s) => {
                const userName = userMap.get(s.user_id) || `User ${s.user_id}`;
                const subprojectLabel =
                    subProjectMap.get(s.subproject_id) || "Sub-project";

                const created = parseCreatedOn(s.created_at);

                return {
                    ...s,
                    userName,
                    subprojectLabel,
                    created,
                    createdDisplay: created
                        ? formatISTDateTime(created)
                        : "-",
                };
            })
            .sort(
                (a, b) =>
                    (b.created?.getTime() || 0) -
                    (a.created?.getTime() || 0)
            );
    }, [scrums, userMap, subProjectMap]);


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
            header: "Today&apos;s Task",
            render: (row) => (
                <span className="whitespace-pre-wrap">
                    {row.today_task}
                </span>
            ),
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
                                userMap.get(d.user_id) || `User ${d.user_id}`;
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
    ];

    return (
        <div className="min-h-screen p-6 space-y-6">
            <DashboardHeader
                title="All Daily Scrums"
                subtitle="Team updates mapped with sub-projects and owners"
                ctaLabel="Back to Dashboard"
                onCta={() => navigate("/")}
            >
                <AddScrumModal/>
            </DashboardHeader>

            <CommonTableCard
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                isError={isError}
                emptyText="No scrums found."
            />
        </div>
    );
};

export default ScrumsPage;
