import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {Building2, GitBranch, UserCircle2} from "lucide-react";
import LoadingDot from "@/Component/Organisation/LoadingDot.jsx";

export default function QuickAddSection({
                                            quickForm,
                                            setQuickForm,
                                            onSubmit,
                                            pending,
                                        }) {
    const disabled =
        !quickForm.dept_name ||
        !quickForm.sub_dept_name ||
        !quickForm.designation_name ||
        pending;

    return (
        <Card
            className="
                border border-amber-100/80
                bg-gradient-to-br from-amber-50/70 via-white/96 to-slate-50/80
                rounded-2xl
                shadow-[0_16px_44px_rgba(15,23,42,0.06)]
                overflow-hidden
            "
        >
            <div className="pointer-events-none absolute -top-8 -right-10 h-24 w-24 rounded-full bg-amber-100/40"/>
            <div className="pointer-events-none absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-amber-50/40"/>

            <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="h-9 w-9 rounded-2xl bg-amber-500/90 flex items-center justify-center text-white shadow-md">
                        <Building2 className="h-4 w-4"/>
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Quick Add: Org Structure in One Go
                        </CardTitle>
                        <p className="text-xs text-slate-500">
                            Create a department, its sub-department, and a primary designation in a single action.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Department */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-700/90">
                            <span
                                className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center text-[9px]">
                                1
                            </span>
                            Department
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Department Name
                            </Label>
                            <Input
                                value={quickForm.dept_name}
                                onChange={(e) =>
                                    setQuickForm((s) => ({
                                        ...s,
                                        dept_name:
                                        e.target.value,
                                    }))
                                }
                                placeholder="e.g., Operations"
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Department Description{" "}
                                <span className="text-[10px] text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                value={quickForm.dept_description}
                                onChange={(e) =>
                                    setQuickForm((s) => ({
                                        ...s,
                                        dept_description:
                                        e.target.value,
                                    }))
                                }
                                placeholder="Scope, region, business unit…"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Sub-Department */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-700/90">
                            <span
                                className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center text-[9px]">
                                2
                            </span>
                            <GitBranch className="h-3 w-3"/>
                            Sub-Department
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Sub-Department Name
                            </Label>
                            <Input
                                value={quickForm.sub_dept_name}
                                onChange={(e) =>
                                    setQuickForm((s) => ({
                                        ...s,
                                        sub_dept_name:
                                        e.target.value,
                                    }))
                                }
                                placeholder="e.g., Logistics"
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Sub-Department Description{" "}
                                <span className="text-[10px] text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                value={
                                    quickForm.sub_dept_description
                                }
                                onChange={(e) =>
                                    setQuickForm((s) => ({
                                        ...s,
                                        sub_dept_description:
                                        e.target.value,
                                    }))
                                }
                                placeholder="Responsibilities, team focus…"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Designation */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-700/90">
                            <span
                                className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center text-[9px]">
                                3
                            </span>
                            <UserCircle2 className="h-3 w-3"/>
                            Designation
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Designation Name
                            </Label>
                            <Input
                                value={quickForm.designation_name}
                                onChange={(e) =>
                                    setQuickForm((s) => ({
                                        ...s,
                                        designation_name:
                                        e.target.value,
                                    }))
                                }
                                placeholder="e.g., Shift Lead"
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">
                                Designation Description{" "}
                                <span className="text-[10px] text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                value={
                                    quickForm.designation_description
                                }
                                onChange={(e) =>
                                    setQuickForm((s) => ({
                                        ...s,
                                        designation_description:
                                        e.target.value,
                                    }))
                                }
                                placeholder="Key role, level, or scope…"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <Separator className="my-5"/>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] text-slate-500">
                        All three will be created together. Use this when you’re setting up a new branch or
                        function quickly.
                    </p>
                    <Button
                        onClick={onSubmit}
                        disabled={disabled}
                        className="h-9 px-5 gap-2 text-xs font-medium bg-amber-500 hover:bg-amber-600"
                    >
                        {pending ? (
                            <>
                                <LoadingDot/>
                                Saving…
                            </>
                        ) : (
                            "Add All"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
