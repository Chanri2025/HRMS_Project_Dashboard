import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {PlusCircle} from "lucide-react";

import {useMe} from "@/hooks/useMe";
import {useSubProjects} from "@/hooks/useSubProjects";
import {useUsers, useCreateScrum} from "@/hooks/useScrums";

export const AddScrumModal = () => {
    const [open, setOpen] = useState(false);

    const [todayTask, setTodayTask] = useState("");
    const [etaDate, setEtaDate] = useState("");
    const [subprojectId, setSubprojectId] = useState("");
    const [concern, setConcern] = useState("");
    const [dependencies, setDependencies] = useState([
        {userId: "", description: ""},
    ]);

    // current user
    const {data: me} = useMe(true);
    const currentUserId = me?.user_id;

    // subprojects + users
    const {subProjects} = useSubProjects();
    const {data: users = []} = useUsers(true);

    const createScrum = useCreateScrum();

    const handleDepChange = (index, field, value) => {
        setDependencies((prev) =>
            prev.map((d, i) => (i === index ? {...d, [field]: value} : d))
        );
    };

    const addDependencyRow = () => {
        setDependencies((prev) => [...prev, {userId: "", description: ""}]);
    };

    const handleSubmit = async () => {
        if (!currentUserId) return;
        if (!subprojectId) return; // sub project REQUIRED
        if (!todayTask.trim()) return;

        const payload = {
            user_id: currentUserId,
            subproject_id: Number(subprojectId),
            today_task: todayTask.trim(),
            eta_date: etaDate || null,
            concern: concern.trim() || null,
            dependencies: dependencies
                .filter((d) => d.userId && d.description.trim())
                .map((d) => ({
                    user_id: Number(d.userId),
                    description: d.description.trim(),
                })),
        };

        await createScrum.mutateAsync(payload);

        if (!createScrum.isError) {
            // reset and close
            setTodayTask("");
            setEtaDate("");
            setSubprojectId("");
            setConcern("");
            setDependencies([{userId: "", description: ""}]);
            setOpen(false);
        }
    };

    const isSubmitDisabled =
        createScrum.isLoading || !todayTask.trim() || !subprojectId;

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2"
                variant="outline"
            >
                <PlusCircle className="h-4 w-4"/>
                Add Scrum
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Daily Scrum</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Subproject (REQUIRED) */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Linked Sub-Project <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={subprojectId}
                                onValueChange={(val) => setSubprojectId(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sub-project"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {subProjects.map((sp) => (
                                        <SelectItem key={sp.id} value={String(sp.id)}>
                                            #{sp.id} —{" "}
                                            {sp.description || sp.subprojectName || "No description"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Today's task (REQUIRED) */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Today&apos;s Task <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                value={todayTask}
                                onChange={(e) => setTodayTask(e.target.value)}
                                placeholder="What are you working on?"
                            />
                        </div>

                        {/* ETA Date */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">ETA Date</label>
                            <Input
                                type="date"
                                value={etaDate}
                                onChange={(e) => setEtaDate(e.target.value)}
                            />
                        </div>

                        {/* Dependencies */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Dependencies</label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={addDependencyRow}
                                >
                                    + Add
                                </Button>
                            </div>

                            {dependencies.map((dep, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-2"
                                >
                                    <Select
                                        value={dep.userId}
                                        onValueChange={(val) =>
                                            handleDepChange(index, "userId", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((u) => (
                                                <SelectItem
                                                    key={u.user_id}
                                                    value={String(u.user_id)}
                                                >
                                                    {u.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        placeholder="Dependency description"
                                        value={dep.description}
                                        onChange={(e) =>
                                            handleDepChange(index, "description", e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Concern */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Concern / Blockers</label>
                            <Textarea
                                value={concern}
                                onChange={(e) => setConcern(e.target.value)}
                                placeholder="Any risk, blocker, or concern?"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={createScrum.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                            {createScrum.isLoading ? "Saving..." : "Save Scrum"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
