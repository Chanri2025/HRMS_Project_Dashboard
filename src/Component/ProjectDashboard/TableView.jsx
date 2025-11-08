// src/Component/ProjectDashboard/TableView.jsx
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Card} from "@/components/ui/card.tsx";
import {useUserById} from "@/hooks/useActiveProjects";

const priorityColors = {
    low: "bg-info/10 text-info border-info/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
    urgent: "bg-destructive text-destructive-foreground",
};

const statusColors = {
    backlog: "bg-muted text-muted-foreground",
    todo: "bg-warning/10 text-warning border-warning/20",
    "in-progress": "bg-info/10 text-info border-info/20",
    done: "bg-success/10 text-success border-success/20",
};

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "NA";
}

function AssigneeCell({assigneeId}) {
    const {data: user} = useUserById(assigneeId);

    const fullName =
        user?.employee?.full_name ||
        user?.full_name ||
        (assigneeId ? `User ${assigneeId}` : "Unassigned");

    const initials = getInitials(fullName);

    return (
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <span className="text-sm">{fullName}</span>
        </div>
    );
}

export function TableView({tasks}) {
    return (
        <Card className="p-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => {
                        const dueLabel =
                            task.endDate instanceof Date && !isNaN(task.endDate.getTime())
                                ? task.endDate.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "2-digit",
                                })
                                : "-";

                        return (
                            <TableRow key={task.id} className="cursor-pointer">
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {task.description}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={statusColors[task.status]}
                                    >
                                        {task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={priorityColors[task.priority]}
                                    >
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <AssigneeCell assigneeId={task.assigneeId}/>
                                </TableCell>
                                <TableCell>{dueLabel}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
