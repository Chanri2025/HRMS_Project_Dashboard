import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import LoadingDot from "@/Component/Organisation/LoadingDot.jsx";

export default function QuickAddSection({quickForm, setQuickForm, onSubmit, pending}) {
    return (
        <Card>
            <CardHeader><CardTitle>Quick Add: Department → Sub-Department → Designation</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input
                                value={quickForm.dept_name}
                                onChange={(e) => setQuickForm((s) => ({...s, dept_name: e.target.value}))}
                                placeholder="e.g., Operations"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Department Description</Label>
                            <Input
                                value={quickForm.dept_description}
                                onChange={(e) => setQuickForm((s) => ({...s, dept_description: e.target.value}))}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Sub-Department Name</Label>
                            <Input
                                value={quickForm.sub_dept_name}
                                onChange={(e) => setQuickForm((s) => ({...s, sub_dept_name: e.target.value}))}
                                placeholder="e.g., Logistics"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sub-Department Description</Label>
                            <Input
                                value={quickForm.sub_dept_description}
                                onChange={(e) => setQuickForm((s) => ({...s, sub_dept_description: e.target.value}))}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Designation Name</Label>
                            <Input
                                value={quickForm.designation_name}
                                onChange={(e) => setQuickForm((s) => ({...s, designation_name: e.target.value}))}
                                placeholder="e.g., Shift Lead"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Designation Description</Label>
                            <Input
                                value={quickForm.designation_description}
                                onChange={(e) => setQuickForm((s) => ({...s, designation_description: e.target.value}))}
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                </div>

                <Separator className="my-6"/>
                <div className="flex justify-end">
                    <Button
                        onClick={onSubmit}
                        disabled={!quickForm.dept_name || !quickForm.sub_dept_name || !quickForm.designation_name || pending}
                    >
                        {pending ? <LoadingDot/> : "Add All"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
