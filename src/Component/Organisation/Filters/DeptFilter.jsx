import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import React from "react";
import {safeArray, SENTINEL_ALL} from "../arrays.js";

export default function DeptFilter({value, onChange, options, loading}) {
    // Radix: don't pass empty string; use undefined + a non-empty sentinel for "All"
    return (
        <div className="min-w-[220px]">
            <Select
                value={value ? String(value) : undefined}
                onValueChange={(v) => onChange(v === SENTINEL_ALL ? "" : v)}
                disabled={loading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Filter by department"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={SENTINEL_ALL}>All Departments</SelectItem>
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