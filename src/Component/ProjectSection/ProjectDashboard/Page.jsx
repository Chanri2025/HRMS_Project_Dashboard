import React, {useState, useMemo, useEffect} from "react";

import {ProjectHeader} from "@/Component/ProjectSection/ProjectDashboard/ProjectHeader/ProjectHeader.jsx";
import {KanbanColumn} from "@/Component/ProjectSection/ProjectDashboard/KanbanColumn.jsx";
import {TaskCard} from "@/Component/ProjectSection/ProjectDashboard/TaskCard.jsx";
import {GanttView} from "@/Component/ProjectSection/ProjectDashboard/GanttView.jsx";
import {TableView} from "@/Component/ProjectSection/ProjectDashboard/TableView.jsx";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs.tsx";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
    useActiveProjects,
    useProjectById,
    useProjectMembers,
} from "@/hooks/useActiveProjects.js";

import {SubProjectCreateDialog} from "@/Component/ProjectSection/ProjectDashboard/ProjectHeader/SubProjectCreateDialog.jsx";
import {
    useUpdateSubProjectStatus,
} from "@/hooks/useSubProjects.js";

// ---------- Map column id -> API project_status ----------
function mapColumnToProjectStatus(columnId) {
    switch (columnId) {
        case "backlog":
            return "Backlog";
        case "todo":
            return "To Do";
        case "in-progress":
            return "Development";
        case "done":
            return "Completed";
        default:
            return null;
    }
}

// ---------- Map API/normalized subprojects -> board tasks ----------
function mapSubprojectsToTasks(subprojects = []) {
    return subprojects.map((sp) => {
        const rawStatus = (sp.project_status || sp.status || "")
            .toLowerCase()
            .trim();

        let status = "todo";

        if (rawStatus === "to do" || rawStatus === "todo") {
            status = "todo";
        } else if (rawStatus === "development" || rawStatus === "dev") {
            status = "in-progress";
        } else if (rawStatus === "testing" || rawStatus === "qa") {
            status = "in-progress";
        } else if (
            rawStatus === "deployment" ||
            rawStatus === "deployed" ||
            rawStatus === "done" ||
            rawStatus === "completed"
        ) {
            status = "done";
        } else if (rawStatus === "backlog") {
            status = "backlog";
        }

        const start =
            sp.created_on ||
            sp.createdOn ||
            sp.created_at ||
            sp.createdAt
                ? new Date(
                    sp.created_on ||
                    sp.createdOn ||
                    sp.created_at ||
                    sp.createdAt
                )
                : new Date();

        const end =
            sp.subproject_deadline ||
            sp.deadline ||
            sp.endDate
                ? new Date(
                    sp.subproject_deadline ||
                    sp.deadline ||
                    sp.endDate
                )
                : start;

        const assigneeId =
            sp.assigned_to ??
            sp.assignedTo ??
            sp.assigned_to_id ??
            null;

        const title =
            sp.subproject_name ||
            sp.subprojectName ||
            sp.name ||
            (sp.description
                ? sp.description.slice(0, 40) +
                (sp.description.length > 40 ? "..." : "")
                : "Subproject");

        return {
            // core identity
            id: String(sp.subproject_id ?? sp.id),

            // for detail modal (read-only fields)
            projectId: sp.project_id ?? null,
            assignedBy: sp.assigned_by ?? null,
            createdOn:
                sp.created_on ||
                sp.createdOn ||
                sp.created_at ||
                sp.createdAt ||
                null,
            lastModified:
                sp.last_modified ||
                sp.updatedAt ||
                sp.updated_at ||
                null,

            // display + editable fields
            title,
            description: sp.description || "",
            priority: "medium",
            status, // backlog | todo | in-progress | done
            assigneeId,
            startDate: start,
            endDate: end,
            storyPoints: sp.storyPoints || 0,
            comments: sp.commentsCount || 0,
        };
    });
}

export default function Page() {
    const [tasks, setTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    const {
        activeProjects,
        activeCount,
        isLoading: projectsLoading,
        isError: projectsError,
    } = useActiveProjects();

    // Select first active project by default
    useEffect(() => {
        if (!projectsLoading && !projectsError && activeProjects?.length > 0) {
            setSelectedProjectId((prev) => prev ?? activeProjects[0].id);
        }
    }, [projectsLoading, projectsError, activeProjects]);

    const {
        data: detailedProject,
        isLoading: projectDetailLoading,
        isError: projectDetailError,
    } = useProjectById(selectedProjectId);

    const baseSelectedProject =
        activeProjects?.find((p) => p.id === selectedProjectId) ||
        activeProjects?.[0] ||
        null;

    const selectedProject = detailedProject || baseSelectedProject || null;

    // Members for create dialog
    const {data: membersData} = useProjectMembers(selectedProject?.id, {
        enabled: !!selectedProject?.id,
    });

    const projectMembers =
        membersData?.members ||
        membersData ||
        selectedProject?.members ||
        [];

    // ---------- Build tasks whenever selectedProject changes ----------
    useEffect(() => {
        const rawSubprojects =
            selectedProject?.subprojects ||
            selectedProject?.sub_projects ||
            selectedProject?.SubProjects ||
            selectedProject?.subProjects ||
            [];

        if (Array.isArray(rawSubprojects) && rawSubprojects.length > 0) {
            setTasks(mapSubprojectsToTasks(rawSubprojects));
        } else {
            setTasks([]);
        }
    }, [selectedProject]);

    // ---------- DnD ----------
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {distance: 8},
        })
    );

    const tasksByStatus = useMemo(
        () => ({
            backlog: tasks.filter((t) => t.status === "backlog"),
            todo: tasks.filter((t) => t.status === "todo"),
            inProgress: tasks.filter((t) => t.status === "in-progress"),
            done: tasks.filter((t) => t.status === "done"),
        }),
        [tasks]
    );

    const {mutate: mutateStatus} = useUpdateSubProjectStatus();

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const {active, over} = event;
        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = tasks.find((t) => t.id === active.id);
        if (!activeTask) {
            setActiveId(null);
            return;
        }

        let overContainer = over.id;

        // If dropped over another card, derive its column
        if (!["backlog", "todo", "in-progress", "done"].includes(overContainer)) {
            const overTask = tasks.find((t) => t.id === overContainer);
            if (overTask) overContainer = overTask.status;
        }

        if (["backlog", "todo", "in-progress", "done"].includes(overContainer)) {
            const project_status = mapColumnToProjectStatus(overContainer);

            // optimistic update
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === activeTask.id
                        ? {...task, status: overContainer}
                        : task
                )
            );

            if (project_status) {
                mutateStatus({
                    id: activeTask.id,
                    project_status,
                    projectId: selectedProject?.id,
                });
            }
        }

        setActiveId(null);
    };

    const activeTask = tasks.find((t) => t.id === activeId);

    const headerLoading = projectsLoading || projectDetailLoading;
    const headerError = projectsError || projectDetailError;

    return (
        <div className="flex flex-col h-screen">
            <ProjectHeader
                loading={headerLoading}
                error={headerError}
                projects={activeProjects}
                activeCount={activeCount}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProjectId}
                tasks={tasks}
                onCreateSubProject={() => setCreateOpen(true)}
            />

            <SubProjectCreateDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                projectId={selectedProject?.id}
                projectMembers={projectMembers}
            />

            <Tabs defaultValue="kanban" className="flex-1 flex flex-col">
                <div className="border-b px-6 py-2">
                    <TabsList>
                        <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        <TabsTrigger value="table">Table</TabsTrigger>
                        <TabsTrigger value="gantt">Gantt</TabsTrigger>
                    </TabsList>
                </div>

                {/* Kanban View */}
                <TabsContent
                    value="kanban"
                    className="flex-1 overflow-x-auto m-0"
                >
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-6 p-6 h-full">
                            {/* Backlog */}
                            <SortableContext
                                items={tasksByStatus.backlog.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <KanbanColumn
                                    id="backlog"
                                    title="Backlog"
                                    count={tasksByStatus.backlog.length}
                                    color="bg-muted"
                                >
                                    {tasksByStatus.backlog.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            status={task.status}
                                        />
                                    ))}
                                </KanbanColumn>
                            </SortableContext>

                            {/* To Do */}
                            <SortableContext
                                items={tasksByStatus.todo.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <KanbanColumn
                                    id="todo"
                                    title="To Do"
                                    count={tasksByStatus.todo.length}
                                    color="bg-warning"
                                >
                                    {tasksByStatus.todo.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            status={task.status}
                                        />
                                    ))}
                                </KanbanColumn>
                            </SortableContext>

                            {/* In Progress */}
                            <SortableContext
                                items={tasksByStatus.inProgress.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <KanbanColumn
                                    id="in-progress"
                                    title="In Progress"
                                    count={tasksByStatus.inProgress.length}
                                    color="bg-info"
                                >
                                    {tasksByStatus.inProgress.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            status={task.status}
                                        />
                                    ))}
                                </KanbanColumn>
                            </SortableContext>

                            {/* Done */}
                            <SortableContext
                                items={tasksByStatus.done.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <KanbanColumn
                                    id="done"
                                    title="Done"
                                    count={tasksByStatus.done.length}
                                    color="bg-success"
                                >
                                    {tasksByStatus.done.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            status={task.status}
                                        />
                                    ))}
                                </KanbanColumn>
                            </SortableContext>
                        </div>

                        <DragOverlay>
                            {activeTask ? (
                                <TaskCard
                                    {...activeTask}
                                    status={activeTask.status}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </TabsContent>

                {/* Table View */}
                <TabsContent
                    value="table"
                    className="flex-1 overflow-auto p-6 m-0"
                >
                    <TableView tasks={tasks}/>
                </TabsContent>

                {/* Gantt View */}
                <TabsContent
                    value="gantt"
                    className="flex-1 overflow-auto p-6 m-0"
                >
                    <GanttView tasks={tasks}/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
