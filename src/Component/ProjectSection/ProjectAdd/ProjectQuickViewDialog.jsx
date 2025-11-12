import React, {useMemo} from "react";
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
import {FolderKanban, Users, ListChecks, Edit3} from "lucide-react";

import {
    useProjectById,
    useProjectMembers,
} from "@/hooks/useActiveProjects.js";

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
    return <Badge className={`rounded-full px-2.5 py-0.5 text-xs ${cls}`}>{status || "Unknown"}</Badge>;
}

function MemberRow({m}) {
    const initials = useMemo(() => {
        const name = m.fullName || m.email || "User";
        const parts = name.trim().split(" ");
        const a = (parts[0]?.[0] || "").toUpperCase();
        const b = (parts[1]?.[0] || "").toUpperCase();
        return (a + b) || "U";
    }, [m]);

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                    <div className="text-sm font-medium">{m.fullName || "Member"}</div>
                    {m.email ? <div className="text-[11px] text-muted-foreground">{m.email}</div> : null}
                </div>
            </div>
        </div>
    );
}

export default function ProjectQuickViewDialog({
                                                   open,
                                                   onOpenChange,
                                                   projectId,
                                                   onEditClick,        // optional: opens your existing Edit dialog
                                                   onCreateSubproject, // optional: open subproject dialog
                                               }) {
    const {data: project, isLoading, isError} = useProjectById(open ? projectId : null);
    const {data: members = [], isLoading: membersLoading} = useProjectMembers(open ? projectId : null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5"/>
                        {project?.name || "Project"}
                    </DialogTitle>
                    <DialogDescription>
                        Quick snapshot of project details, members, and actions.
                    </DialogDescription>
                </DialogHeader>

                {/* Header strip */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={project?.status}/>
                    </div>

                    <div className="flex items-center gap-2">
                        {onCreateSubproject && (
                            <Button size="sm" onClick={() => onCreateSubproject(projectId)}>
                                <ListChecks className="h-4 w-4 mr-1"/>
                                Create Sub Project
                            </Button>
                        )}
                        {onEditClick && (
                            <Button size="sm" variant="secondary" onClick={() => onEditClick(project)}>
                                <Edit3 className="h-4 w-4 mr-1"/>
                                Edit
                            </Button>
                        )}
                    </div>
                </div>

                <Separator className="my-3"/>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="meta">Meta</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW */}
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
                                                <div className="text-xs text-muted-foreground mb-1">Created On</div>
                                                <div
                                                    className="text-sm">{project?.createdOn ? String(project.createdOn) : "—"}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Last Modified</div>
                                                <div
                                                    className="text-sm">{project?.lastModified ? String(project.lastModified) : "—"}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* MEMBERS */}
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
                                    <div className="text-sm text-muted-foreground">No members assigned.</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* META */}
                    <TabsContent value="meta" className="mt-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Card className="bg-card/70 border-border/60 rounded-xl">
                                <CardContent className="p-4">
                                    <div className="text-xs text-muted-foreground">Project ID</div>
                                    <div className="text-sm">{projectId || "—"}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/70 border-border/60 rounded-xl">
                                <CardContent className="p-4">
                                    <div className="text-xs text-muted-foreground">Created By</div>
                                    <div className="text-sm">{project?.createdById ?? "—"}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
