import React, {useMemo, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FolderKanban, Trash2} from "lucide-react";

import {
    useProjectById,
    useProjectMembers,
    useUserById,
    useDeleteProject,
} from "@/hooks/useActiveProjects.js";
import ConfirmDialog from "@/Utils/ConfirmDialog.jsx";

/* ------------------ Small reusable UI bits ------------------ */
function StatusBadge({status}) {
    const s = (status || "").toLowerCase();
    const cls =
        s === "active"
            ? "bg-emerald-100 text-emerald-800"
            : s === "completed"
                ? "bg-sky-100 text-sky-800"
                : s === "on hold"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-muted text-muted-foreground";
    return (
        <Badge className={`rounded-full px-2.5 py-0.5 text-xs ${cls}`}>
            {status || "Unknown"}
        </Badge>
    );
}

/* ------------------ Member Row (uses useUserById) ------------------ */
function MemberRow({m}) {
    const userId = m.userId ?? m.id ?? null;
    const {data: user, isLoading} = useUserById(userId);

    const fullName =
        user?.employee?.full_name ||
        user?.full_name ||
        user?.name ||
        m.fullName ||
        m.email ||
        "Member";

    const email =
        user?.employee?.email ||
        user?.email ||
        m.email ||
        "";

    const initials = useMemo(() => {
        const base = fullName || email || "U";
        const parts = String(base).trim().split(/\s+/);
        const a = (parts[0]?.[0] || "").toUpperCase();
        const b = (parts[1]?.[0] || "").toUpperCase();
        return (a + b) || "U";
    }, [fullName, email]);

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                    <div className="text-sm font-medium">
                        {isLoading ? "Loading…" : fullName}
                    </div>
                    {email ? (
                        <div className="text-[11px] text-muted-foreground">{email}</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

/* ------------------ Main Dialog ------------------ */
export default function ProjectQuickViewDialog({
                                                   open,
                                                   onOpenChange,
                                                   projectId,
                                               }) {
    const {data: project, isLoading, isError} = useProjectById(open ? projectId : null);
    const {data: members = [], isLoading: membersLoading} = useProjectMembers(
        open ? projectId : null
    );

    /* ------- delete flow ------- */
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const deleteProject = useDeleteProject();
    const handleDelete = async () => {
        if (!projectId) return;
        await deleteProject.mutateAsync(projectId, {
            onSuccess: () => {
                setConfirmDeleteOpen(false);
                onOpenChange(false);
            },
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5"/>
                            {project?.name || "Project"}
                        </DialogTitle>
                        <DialogDescription>
                            Quick snapshot of project details and members.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Action Bar (Create Sub Project + Edit removed) */}
                    <div className="flex items-center justify-between">
                        <StatusBadge status={project?.status}/>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setConfirmDeleteOpen(true)}
                                disabled={!projectId || deleteProject.isLoading}
                            >
                                <Trash2 className="h-4 w-4 mr-1"/>
                                {deleteProject.isLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-3"/>

                    <Tabs defaultValue="overview" className="w-full">
                        {/* Only two tabs now */}
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                        </TabsList>

                        {/* Overview */}
                        <TabsContent value="overview" className="mt-4">
                            <Card className="bg-card/70 border-border/60 rounded-xl">
                                <CardContent className="p-4 space-y-3">
                                    {isLoading ? (
                                        <div className="text-sm text-muted-foreground">Loading project…</div>
                                    ) : isError ? (
                                        <div className="text-sm text-destructive">Failed to load project.</div>
                                    ) : (
                                        <>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Description</div>
                                                <div className="text-sm">{project?.description || "—"}</div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        Created On
                                                    </div>
                                                    <div className="text-sm">
                                                        {project?.createdOn ? String(project.createdOn) : "—"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        Last Modified
                                                    </div>
                                                    <div className="text-sm">
                                                        {project?.lastModified ? String(project.lastModified) : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Members */}
                        <TabsContent value="members" className="mt-4">
                            <Card className="bg-card/70 border-border/60 rounded-xl">
                                <CardContent className="p-4">
                                    {membersLoading ? (
                                        <div className="text-sm text-muted-foreground">Loading members…</div>
                                    ) : members.length ? (
                                        <div className="divide-y">
                                            {members.map((m) => (
                                                <MemberRow key={m.userId || m.email} m={m}/>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">
                                            No members assigned.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title="Delete this project?"
                description={`"${
                    project?.name || "Project"
                }" will be permanently removed. This cannot be undone.`}
                confirmText={deleteProject.isLoading ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
                loading={deleteProject.isLoading}
            />
        </>
    );
}
