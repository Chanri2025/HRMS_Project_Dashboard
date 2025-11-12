// src/Component/ProjectSection/ProjectDashboard/AssigneeSelect.jsx
import React, {useMemo} from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select.tsx";
import {useProjectMembers} from "@/hooks/useActiveProjects.js";
import {useUserLabel} from "@/hooks/useOrgLookups.js";

const UNASSIGNED = "__UNASSIGNED__"; // non-empty sentinel to avoid Radix error

// Row label that loads the user's REAL name and shows only the name
function AssigneeRow({id}) {
    const {name} = useUserLabel(id); // <- hook also returns .name
    return <span className="text-xs">{name || "User"}</span>;
}

// Selected text (only the name)
function SelectedText({id}) {
    const {name} = useUserLabel(id);
    return <span className="truncate">{name || "User"}</span>;
}

/**
 * Props:
 *  - projectId: number | string | null
 *  - value: number | null
 *  - onChange: (number|null) => void
 *  - className?: string
 */
export function AssigneeSelect({projectId, value, onChange, className}) {
    const {data: projectMembers = [], isLoading} = useProjectMembers(projectId);

    // Only collect userIds from members; names come from useUserLabel
    const optionIds = useMemo(() => {
        const ids = new Set();
        for (const m of projectMembers || []) {
            const id = m?.userId ?? m?.user_id ?? m?.id;
            if (id != null) ids.add(String(id));
        }
        return Array.from(ids);
    }, [projectMembers]);

    const hasSelected = value !== undefined && value !== null && value !== "";
    const selectedIdStr = hasSelected ? String(value) : undefined;

    const handleChange = (next) => {
        if (next === UNASSIGNED) return onChange(null);
        onChange(next ? Number(next) : null);
    };

    return (
        <Select
            value={selectedIdStr ?? (hasSelected ? UNASSIGNED : undefined)}
            onValueChange={handleChange}
            disabled={isLoading || optionIds.length === 0}
        >
            <SelectTrigger className={className || "w-full h-8 text-[11px] justify-between"}>
                <SelectValue
                    placeholder={
                        isLoading
                            ? "Loading members..."
                            : optionIds.length
                                ? "Select assignee"
                                : "No members available"
                    }
                >
                    {selectedIdStr ? <SelectedText id={selectedIdStr}/> : null}
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {optionIds.map((id) => (
                    <SelectItem key={id} value={id}>
                        <div className="flex flex-col">
                            <AssigneeRow id={id}/>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
