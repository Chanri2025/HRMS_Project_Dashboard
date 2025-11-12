import React, {useMemo, useState} from "react";
import {
    useActiveProjects,
    useProjectById,
    useProjectMembers,
    useDeleteProject,
    useUserById, // 👈 import
} from "@/hooks/useActiveProjects.js";
import ConfirmDialog from "@/Utils/ConfirmDialog.jsx";

import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    Plus,
    FolderKanban,
    Users,
    ListChecks,
    Sparkles,
    Edit3,
    Trash2,
} from "lucide-react";
import NewProjectModal from "./NewProjectModal.jsx";

/* ----------------------------- Small UI bits ------------------------------ */

function StatusBadge({status}) {
    const s = (status || "").toLowerCase();
    const map =
        s === "active"
            ? "bg-emerald-100 text-emerald-800"
            : s === "completed"
                ? "bg-sky-100 text-sky-800"
                : s === "on hold"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-muted text-muted-foreground";
    return (
        <Badge className={`rounded-full px-2.5 py-0.5 text-xs ${map}`}>
            {status || "Unknown"}
        </Badge>
    );
}

function StatCard({icon: Icon, label, value, hint, accent = ""}) {
    return (
        <Card className="border-border/60 bg-card/70 backdrop-blur hover:shadow-sm transition rounded-2xl">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl grid place-content-center ${accent}`}>
                            <Icon className="h-5 w-5"/>
                        </div>
                        <div>
                            <div className="text-[12px] text-muted-foreground">{label}</div>
                            <div className="text-xl font-semibold leading-6">{value}</div>
                        </div>
                    </div>
                    {hint ? <div className="text-[11px] text-muted-foreground">{hint}</div> : null}
                </div>
            </CardContent>
        </Card>
    );
}

/* ----------------------- Quick View Modal (inline) ------------------------ */

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

    const initials = React.useMemo(() => {
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

function ProjectQuickViewDialog({
                                    open,
                                    onOpenChange,
                                    projectId,
                                    onEditClick,
                                    onCreateSubproject,
                                }) {
    const {data: project, isLoading, isError} = useProjectById(open ? projectId : null);
    const {data: members = [], isLoading: membersLoading} = useProjectMembers(open ? projectId : null);

    // Delete logic for inline quick-view
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
                            Quick snapshot of project details, members, and metadata.
                        </DialogDescription>
                    </DialogHeader>

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
                                                    <div className="text-sm">
                                                        {project?.createdOn ? String(project.createdOn) : "—"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Last Modified
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

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title="Delete this project?"
                description={`"${project?.name || "Project"}" will be permanently removed. This cannot be undone.`}
                confirmText={deleteProject.isLoading ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
                loading={deleteProject.isLoading}
            />
        </>
    );
}

/* ------------------------------ Project card ------------------------------ */

function ProjectCard({p, onOpen}) {
    return (
        <Card
            onClick={() => onOpen?.(p.id)}
            className="group cursor-pointer border-border/60 bg-gradient-to-b from-card via-card/70 to-muted/40 hover:shadow-md transition rounded-2xl"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.(p.id)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{p.name}</CardTitle>
                    <StatusBadge status={p.status}/>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.description || "—"}
                </p>

                <Separator className="my-4"/>

                <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <FolderKanban className="h-4 w-4"/>
                        <span>Project</span>
                    </div>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen?.(p.id);
                        }}
                    >
                        Open
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/* --------------------------------- Page ---------------------------------- */

export default function ProjectsPage() {
    const {data: all = [], isLoading} = useActiveProjects();
    const [createOpen, setCreateOpen] = useState(false);

    // quick view state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const activeCount = useMemo(
        () => all.filter((p) => (p.status || "").toLowerCase() === "active").length,
        [all]
    );

    const handleOpenProject = (pid) => {
        setSelectedId(pid);
        setPreviewOpen(true);
    };

    // Optional callbacks to hook into your existing edit/subproject modals elsewhere.
    const handleEditFromQuickView = () => {
        // setPreviewOpen(false);
        // open your edit modal here
    };

    const handleSubprojectFromQuickView = () => {
        // setPreviewOpen(false);
        // open your subproject modal here
    };

    return (
        <div className="space-y-6 p-6">
            {/* HERO */}
            <div
                className="rounded-2xl border border-border/60 bg-gradient-to-r from-indigo-50 via-background to-sky-50 dark:from-background dark:via-background dark:to-background/60 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Sparkles className="h-5 w-5"/>
                            Project Section
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage projects, track status, add members, and create new ones.
                        </p>
                    </div>

                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Create Project
                    </Button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={FolderKanban}
                    label="Active Projects"
                    value={activeCount}
                    hint="Live"
                    accent="bg-blue-100 text-blue-700"
                />
                <StatCard
                    icon={ListChecks}
                    label="My Scrums"
                    value={0}
                    hint="Total"
                    accent="bg-violet-100 text-violet-700"
                />
                <StatCard
                    icon={Users}
                    label="Team Members"
                    value={3}
                    hint="Active"
                    accent="bg-emerald-100 text-emerald-700"
                />
                <StatCard
                    icon={Sparkles}
                    label="Completion"
                    value="—"
                    hint=""
                    accent="bg-amber-100 text-amber-700"
                />
            </div>

            {/* LIST */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 6}).map((_, i) => (
                        <Card key={i} className="rounded-2xl">
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-4 w-2/3"/>
                                <Skeleton className="h-3 w-full"/>
                                <Skeleton className="h-3 w-5/6"/>
                                <Skeleton className="h-8 w-full mt-4"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : all.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {all.map((p) => (
                        <ProjectCard key={p.id} p={p} onOpen={handleOpenProject}/>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            No projects yet. Create your first project to get started.
                        </p>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Create Project Modal */}
            <NewProjectModal open={createOpen} onOpenChange={setCreateOpen}/>

            {/* Quick View Modal */}
            <ProjectQuickViewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                projectId={selectedId}
                onEditClick={handleEditFromQuickView}
                onCreateSubproject={handleSubprojectFromQuickView}
            />
        </div>
    );
}
