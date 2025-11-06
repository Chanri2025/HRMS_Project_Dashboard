import React from "react";
import {Card} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useDeptMembers} from "@/hooks/useDeptMembers";
import {useDepartmentName} from "@/hooks/useDepartmentName";

export const TeamMembersCard = ({members, deptId, autoFetch = true}) => {
    const shouldFetch = autoFetch && !members;
    const {data, isLoading, isError, error, deptId: detectedDeptId} =
        useDeptMembers(shouldFetch ? deptId : undefined);

    const list = members ?? data ?? [];
    const finalDeptId = deptId ?? detectedDeptId;

    // Fetch department name
    const {
        data: deptName,
        isLoading: deptLoading,
        isError: deptError,
    } = useDepartmentName(finalDeptId);

    return (
        <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
                Team Members
            </h2>

            {isLoading && (
                <div className="space-y-3">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="h-9 w-9 rounded-full bg-muted"/>
                            <div className="flex-1 space-y-1">
                                <div className="h-3 w-40 bg-muted rounded"/>
                                <div className="h-3 w-56 bg-muted rounded"/>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isError && !isLoading && (
                <p className="text-sm text-destructive">
                    Failed to load members{error?.message ? `: ${error.message}` : ""}.
                </p>
            )}

            {!isLoading && !isError && (
                <div className="space-y-3">
                    {list.map((m, idx) => (
                        <div
                            key={`${m.email || m.name || idx}-${idx}`}
                            className="flex items-center gap-3"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {m.initials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{m.name}</p>
                                {m.email && (
                                    <p className="text-xs text-muted-foreground">{m.email}</p>
                                )}
                                {m.phone && (
                                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                                )}
                            </div>

                            {/* show dept name instead of id */}
                            {finalDeptId && (
                                <span className="text-[11px] px-2 py-1 rounded bg-muted text-muted-foreground">
                  {deptLoading
                      ? "Loading..."
                      : deptError
                          ? `Dept #${finalDeptId}`
                          : deptName || `Dept #${finalDeptId}`}
                </span>
                            )}
                        </div>
                    ))}

                    {list.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No members found for this department.
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
};
