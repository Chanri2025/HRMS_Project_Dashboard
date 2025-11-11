// src/Component/ProjectDashboard/ProjectHeader/ProjectHeader.jsx
import React from "react";
import {useUserById} from "@/hooks/useActiveProjects.js";
import {
    parseCreatedOn,
    calcDaysElapsed,
} from "../../../../Utils/ProjectHeader.helpers.js";
import {SprintHeaderTitle} from "./SprintHeaderTitle.jsx";
import {ProjectHeaderActions} from "./ProjectHeaderActions.jsx";
import {ProjectHeaderStats} from "./ProjectHeaderStats.jsx";

export function ProjectHeader({
                                  loading,
                                  error,
                                  projects = [],
                                  activeCount = 0,
                                  selectedProject,
                                  onSelectProject,
                                  tasks = [],
                              }) {
    // Tasks shown in board/table/gantt
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;

    // Created by
    const createdById = selectedProject?.createdById;
    const {data: createdByUser} = useUserById(createdById);

    // Created_on + elapsed
    const createdOnStr = selectedProject?.createdOn;
    const startDate = createdOnStr ? parseCreatedOn(createdOnStr) : null;

    const createdOnLabel = startDate
        ? startDate.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    const daysElapsed = startDate ? calcDaysElapsed(startDate) : null;

    return (
        <div className="bg-card border-b px-6 py-4">
            <div className="flex items-center justify-between">
                <SprintHeaderTitle
                    loading={loading}
                    error={error}
                    selectedProject={selectedProject}
                    activeCount={activeCount}
                    createdByUser={createdByUser}
                    createdOnLabel={createdOnLabel}
                    daysElapsed={daysElapsed}
                />

                <ProjectHeaderActions
                    loading={loading}
                    error={error}
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={onSelectProject}
                />
            </div>

            <ProjectHeaderStats
                totalTasks={totalTasks}
                doneTasks={doneTasks}
                inProgressTasks={inProgressTasks}
            />
        </div>
    );
}
