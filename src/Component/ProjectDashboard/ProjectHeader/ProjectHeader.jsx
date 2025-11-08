import React from "react";
import {useUserById} from "@/hooks/useActiveProjects.js";
import {
    parseCreatedOn,
    addDays,
    formatRange,
    calcDaysRemaining,
} from "./ProjectHeader.helpers.js";
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
    // Metrics
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const storyPoints = tasks.reduce(
        (sum, t) => sum + (t.storyPoints || 0),
        0
    );

    // Created by
    const createdById = selectedProject?.createdById;
    const {data: createdByUser} = useUserById(createdById);

    // Dates (30 days from created_on)
    const createdOnStr = selectedProject?.createdOn;
    const startDate = createdOnStr ? parseCreatedOn(createdOnStr) : null;
    const endDate = startDate ? addDays(startDate, 30) : null;
    const dateRange =
        startDate && endDate ? formatRange(startDate, endDate) : null;
    const daysRemaining = endDate ? calcDaysRemaining(endDate) : null;

    return (
        <div className="bg-card border-b px-6 py-4">
            <div className="flex items-center justify-between">
                <SprintHeaderTitle
                    loading={loading}
                    error={error}
                    selectedProject={selectedProject}
                    activeCount={activeCount}
                    createdByUser={createdByUser}
                    dateRange={dateRange}
                    daysRemaining={daysRemaining}
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
                storyPoints={storyPoints}
            />
        </div>
    );
}
