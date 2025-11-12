import React, {useMemo, useState} from "react";
import {useActiveProjects} from "@/hooks/useActiveProjects.js";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";
import {Plus, FolderKanban, Users, ListChecks, Sparkles} from "lucide-react";
import NewProjectModal from "./NewProjectModal.jsx";
// optional: use navigate if you want “View Board” to route somewhere
// import { useNavigate } from "react-router-dom";

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

function ProjectCard({p /*, onView*/}) {
    return (
        <Card
            className="group border-border/60 bg-gradient-to-b from-card via-card/70 to-muted/40 hover:shadow-md transition rounded-2xl">
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
                        {/* hide raw IDs to keep it clean */}
                    </div>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        // onClick={() => onView?.(p.id)}
                    >
                        View Board
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ProjectsPage() {
    const {data: all = [], isLoading} = useActiveProjects();
    const [open, setOpen] = useState(false);
    // const navigate = useNavigate();

    const activeCount = useMemo(
        () => all.filter((p) => (p.status || "").toLowerCase() === "active").length,
        [all]
    );

    // const handleView = (pid) => navigate(`/project-dashboard/${pid}`);

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

                    <Button onClick={() => setOpen(true)}>
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
                        <ProjectCard key={p.id} p={p} /*onView={handleView}*/ />
                    ))}
                </div>
            ) : (
                <Card className="border-dashed rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            No projects yet. Create your first project to get started.
                        </p>
                        <Button onClick={() => setOpen(true)}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            )}

            <NewProjectModal open={open} onOpenChange={setOpen}/>
        </div>
    );
}
