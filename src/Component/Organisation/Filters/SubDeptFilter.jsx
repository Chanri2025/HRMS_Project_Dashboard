import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";
import {safeArray} from "@/Component/Organisation/arrays.js";

export default function SubDeptFilter({value, onChange, options, disabled, loading}) {
    return (
        <div className="min-w-[220px]">
            <Select
                value={value ? String(value) : undefined}
                onValueChange={(v) => onChange(v === SENTINEL_ALL ? "" : v)}
                disabled={disabled || loading}
            >
                <SelectTrigger>
                    <SelectValue placeholder={disabled ? "Select dept first" : "Filter by sub-dept"}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={SENTINEL_ALL}>All Sub-Departments</SelectItem>
                    {safeArray(options).map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}