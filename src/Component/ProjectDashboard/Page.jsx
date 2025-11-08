import React, {useState, useMemo, useEffect} from "react";

import {ProjectHeader} from "@/Component/ProjectDashboard/ProjectHeader/ProjectHeader.jsx";
import {KanbanColumn} from "@/Component/ProjectDashboard/KanbanColumn.jsx";
import {TaskCard} from "@/Component/ProjectDashboard/TaskCard.jsx";
import {GanttView} from "@/Component/ProjectDashboard/GanttView.jsx";
import {TableView} from "@/Component/ProjectDashboard/TableView.jsx";

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

import {SubProjectCreateDialog} from "@/Component/ProjectDashboard/ProjectHeader/SubProjectCreateDialog.jsx";

// ---------- Map API subprojects -> board tasks (statuses aligned with dropdown) ----------
function mapSubprojectsToTasks(subprojects = []) {
    return subprojects.map((sp) => {
        const rawStatus = (
            sp.project_status ||
            sp.status ||
            ""
        )
            .toLowerCase()
            .trim();

        // Kanban column key (only these four)
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
            sp.created_on || sp.createdOn
                ? new Date(sp.created_on || sp.createdOn)
                : new Date();

        const end = sp.subproject_deadline
            ? new Date(sp.subproject_deadline)
            : start;

        const assigneeId = sp.assigned_to ?? sp.assignedTo ?? null;

        const title =
            sp.subproject_name ||
            (sp.description
                ? sp.description.slice(0, 40) +
                (sp.description.length > 40 ? "..." : "")
                : "Subproject");

        return {
            id: String(sp.subproject_id ?? sp.id),
            title,
            description: sp.description || "",
            priority: "medium",
            status, // one of: backlog | todo | in-progress | done
            assigneeId,
            startDate: start,
            endDate: end,
            storyPoints: 0,
            comments: 0,
        };
    });
}

export default function Page() {
    const [tasks, setTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    // ---------- Load active projects ----------
    const {
        activeProjects,
        activeCount,
        isLoading: projectsLoading,
        isError: projectsError,
    } = useActiveProjects();

    // Default select first active project
    useEffect(() => {
        if (!projectsLoading && !projectsError && activeProjects?.length > 0) {
            setSelectedProjectId((prev) => prev ?? activeProjects[0].id);
        }
    }, [projectsLoading, projectsError, activeProjects]);

    // ---------- Detailed project ----------
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

    // ---------- Project members for dialog dropdowns ----------
    const {data: membersData} = useProjectMembers(selectedProject?.id, {
        enabled: !!selectedProject?.id,
    });

    const projectMembers =
        membersData?.members ||
        membersData ||
        selectedProject?.members ||
        [];

    // ---------- Build tasks whenever subprojects change ----------
    useEffect(() => {
        if (selectedProject?.subprojects) {
            setTasks(mapSubprojectsToTasks(selectedProject.subprojects));
        } else {
            setTasks([]);
        }
    }, [selectedProject?.subprojects]);

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

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const {active, over} = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t.id === active.id);
        const overContainer = over.id;

        if (
            activeTask &&
            ["backlog", "todo", "in-progress", "done"].includes(overContainer)
        ) {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === activeTask.id
                        ? {...task, status: overContainer}
                        : task
                )
            );
            // here you can also call your update-subproject-status API if needed
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
                // hook the "Create Sub Project" button in header to this:
                onCreateSubProject={() => setCreateOpen(true)}
            />

            {/* Create Sub Project Modal */}
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
                <TabsContent value="kanban" className="flex-1 overflow-x-auto m-0">
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
                                        <TaskCard key={task.id} {...task} />
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
                                        <TaskCard key={task.id} {...task} />
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
                                        <TaskCard key={task.id} {...task} />
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
                                        <TaskCard key={task.id} {...task} />
                                    ))}
                                </KanbanColumn>
                            </SortableContext>
                        </div>

                        <DragOverlay>
                            {activeTask ? <TaskCard {...activeTask} /> : null}
                        </DragOverlay>
                    </DndContext>
                </TabsContent>

                {/* Table View */}
                <TabsContent value="table" className="flex-1 overflow-auto p-6 m-0">
                    <TableView tasks={tasks}/>
                </TabsContent>

                {/* Gantt View */}
                <TabsContent value="gantt" className="flex-1 overflow-auto p-6 m-0">
                    <GanttView tasks={tasks}/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
