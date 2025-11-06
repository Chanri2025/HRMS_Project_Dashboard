import React, { useState } from "react";
import { SprintHeader } from "@/Utils/SprintHeader.jsx";
import { KanbanColumn } from "@/Utils/KanbanColumn.jsx";
import { TaskCard } from "@/Utils/TaskCard.jsx";
import { GanttView } from "@/Utils/GanttView.jsx";
import { TableView } from "@/Utils/TableView.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const initialTasks = [
  {
    id: "1",
    title: "Implement user profile settings",
    description:
      "Add ability for users to update their profile information and preferences",
    priority: "medium",
    status: "backlog",
    assignee: { name: "Alex Chen", initials: "AC" },
    storyPoints: 5,
    comments: 3,
    startDate: new Date(2025, 9, 20),
    endDate: new Date(2025, 9, 25),
  },
  {
    id: "2",
    title: "Database optimization",
    description: "Optimize database queries for better performance",
    priority: "low",
    status: "backlog",
    assignee: { name: "Sam Wilson", initials: "SW" },
    storyPoints: 8,
    comments: 1,
    startDate: new Date(2025, 9, 21),
    endDate: new Date(2025, 9, 28),
  },
  {
    id: "3",
    title: "Design new onboarding flow",
    description:
      "Create wireframes and mockups for improved user onboarding experience",
    priority: "high",
    status: "todo",
    assignee: { name: "Jordan Lee", initials: "JL" },
    storyPoints: 8,
    comments: 5,
    startDate: new Date(2025, 9, 22),
    endDate: new Date(2025, 9, 29),
  },
  {
    id: "4",
    title: "API documentation",
    description: "Complete API documentation for v2 endpoints",
    priority: "medium",
    status: "todo",
    assignee: { name: "Taylor Kim", initials: "TK" },
    storyPoints: 3,
    comments: 2,
    startDate: new Date(2025, 9, 23),
    endDate: new Date(2025, 9, 26),
  },
  {
    id: "5",
    title: "Authentication system upgrade",
    description:
      "Migrate to new OAuth 2.0 implementation with improved security",
    priority: "urgent",
    status: "in-progress",
    assignee: { name: "Morgan Park", initials: "MP" },
    storyPoints: 13,
    comments: 8,
    startDate: new Date(2025, 9, 18),
    endDate: new Date(2025, 9, 30),
  },
  {
    id: "6",
    title: "Mobile responsive fixes",
    description: "Fix layout issues on mobile devices for dashboard",
    priority: "high",
    status: "in-progress",
    assignee: { name: "Casey Brown", initials: "CB" },
    storyPoints: 5,
    comments: 4,
    startDate: new Date(2025, 9, 19),
    endDate: new Date(2025, 9, 24),
  },
  {
    id: "7",
    title: "Add dark mode support",
    description: "Implement dark mode theme across all pages",
    priority: "medium",
    status: "done",
    assignee: { name: "Riley Davis", initials: "RD" },
    storyPoints: 8,
    comments: 12,
    startDate: new Date(2025, 9, 10),
    endDate: new Date(2025, 9, 18),
  },
  {
    id: "8",
    title: "Email notification system",
    description: "Set up automated email notifications for task updates",
    priority: "high",
    status: "done",
    assignee: { name: "Jordan Lee", initials: "JL" },
    storyPoints: 5,
    comments: 6,
    startDate: new Date(2025, 9, 12),
    endDate: new Date(2025, 9, 19),
  },
];

export default function Board() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = {
    backlog: tasks.filter((t) => t.status === "backlog"),
    todo: tasks.filter((t) => t.status === "todo"),
    inProgress: tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overContainer = over.id;

    if (
      activeTask &&
      ["backlog", "todo", "in-progress", "done"].includes(overContainer)
    ) {
      const newStatus = overContainer;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === activeTask.id ? { ...task, status: newStatus } : task
        )
      );
    }

    setActiveId(null);
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <div className="flex flex-col h-screen">
      <SprintHeader />

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
            onDragEnd={handleDragEnd}>
            <div className="flex gap-6 p-6 h-full">
              <SortableContext
                items={tasksByStatus.backlog.map((t) => t.id)}
                strategy={verticalListSortingStrategy}>
                <KanbanColumn
                  id="backlog"
                  title="Backlog"
                  count={tasksByStatus.backlog.length}
                  color="bg-muted">
                  {tasksByStatus.backlog.map((task) => (
                    <TaskCard key={task.id} {...task} />
                  ))}
                </KanbanColumn>
              </SortableContext>

              <SortableContext
                items={tasksByStatus.todo.map((t) => t.id)}
                strategy={verticalListSortingStrategy}>
                <KanbanColumn
                  id="todo"
                  title="To Do"
                  count={tasksByStatus.todo.length}
                  color="bg-warning">
                  {tasksByStatus.todo.map((task) => (
                    <TaskCard key={task.id} {...task} />
                  ))}
                </KanbanColumn>
              </SortableContext>

              <SortableContext
                items={tasksByStatus.inProgress.map((t) => t.id)}
                strategy={verticalListSortingStrategy}>
                <KanbanColumn
                  id="in-progress"
                  title="In Progress"
                  count={tasksByStatus.inProgress.length}
                  color="bg-info">
                  {tasksByStatus.inProgress.map((task) => (
                    <TaskCard key={task.id} {...task} />
                  ))}
                </KanbanColumn>
              </SortableContext>

              <SortableContext
                items={tasksByStatus.done.map((t) => t.id)}
                strategy={verticalListSortingStrategy}>
                <KanbanColumn
                  id="done"
                  title="Done"
                  count={tasksByStatus.done.length}
                  color="bg-success">
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
          <TableView tasks={tasks} />
        </TabsContent>

        {/* Gantt View */}
        <TabsContent value="gantt" className="flex-1 overflow-auto p-6 m-0">
          <GanttView tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
