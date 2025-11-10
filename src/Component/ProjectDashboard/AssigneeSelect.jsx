import React, {useMemo} from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select.tsx";
import {useProjectMembers, useUserById} from "@/hooks/useActiveProjects.js";

/**
 * AssigneeSelect
 *
 * Props:
 *  - projectId: number | string | null
 *  - value: userId | null
 *  - onChange: (userIdOrNull) => void
 *  - className?: string
 */
export function AssigneeSelect({projectId, value, onChange, className}) {
    const {
        data: projectMembers = [],
        isLoading,
    } = useProjectMembers(projectId);

    // Build options from project members (normalize all possible name fields)
    const options = useMemo(
        () =>
            (projectMembers || [])
                .map((m) => {
                    const userId =
                        m.userId ??
                        m.user_id ??
                        m.id ??
                        null;

                    if (!userId) return null;

                    const fullName =
                        m.fullName ||                    // from normalizeProjectMember
                        m.full_name ||                   // raw API variant
                        m.name ||
                        m.employee?.full_name ||
                        "";

                    const email =
                        m.email ||
                        m.employee?.email ||
                        "";

                    const label =
                        fullName ||
                        email ||
                        `User #${userId}`;

                    const subtitle = [email].filter(Boolean).join(" • ");

                    return {
                        userId: String(userId),
                        label,
                        subtitle,
                    };
                })
                .filter(Boolean),
        [projectMembers]
    );

    // If current value is not in project members, fetch it directly
    const hasSelected =
        value !== undefined && value !== null && value !== "";
    const selectedIdStr = hasSelected ? String(value) : "";

    const selectedInOptions = options.find(
        (o) => o.userId === selectedIdStr
    );

    const shouldLoadFallback = hasSelected && !selectedInOptions;
    const {data: fallbackUser} = useUserById(
        shouldLoadFallback ? value : null
    );

    const fallbackOption = shouldLoadFallback && fallbackUser
        ? {
            userId: String(
                fallbackUser.user_id ??
                fallbackUser.id ??
                value
            ),
            label:
                fallbackUser.employee?.full_name ||
                fallbackUser.full_name ||
                `User #${value}`,
            subtitle: fallbackUser.email || "",
        }
        : null;

    const allOptions = [...options, ...(fallbackOption ? [fallbackOption] : [])];

    const selected = allOptions.find(
        (o) => o.userId === selectedIdStr
    );

    const handleChange = (next) => {
        onChange(next ? Number(next) : null);
    };

    return (
        <Select
            value={selected ? selected.userId : ""}
            onValueChange={handleChange}
            disabled={isLoading || !allOptions.length}
        >
            <SelectTrigger
                className={className || "w-full h-8 text-[11px] justify-between"}
            >
                <SelectValue
                    placeholder={
                        isLoading
                            ? "Loading members..."
                            : allOptions.length
                                ? "Select assignee"
                                : "No members available"
                    }
                >
                    {selected ? (
                        <span className="truncate">
              {selected.label}
                            {selected.subtitle && (
                                <span className="text-[9px] text-muted-foreground">
                  {" "}
                                    — {selected.subtitle}
                </span>
                            )}
            </span>
                    ) : null}
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                {allOptions.map((opt) => (
                    <SelectItem key={opt.userId} value={opt.userId}>
                        <div className="flex flex-col">
                            <span className="text-xs">{opt.label}</span>
                            {opt.subtitle && (
                                <span className="text-[9px] text-muted-foreground">
                  {opt.subtitle}
                </span>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
