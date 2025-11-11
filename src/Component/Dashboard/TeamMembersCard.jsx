import React from "react";
import {Card} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useDeptMembers} from "@/hooks/useDeptMembers";
import {useDepartmentName} from "@/hooks/useDepartmentName";
import {Users2} from "lucide-react"; // 👈 Modern icon import

function getDisplayName(member) {
    return (
        member.full_name ||
        member.name ||
        member.username ||
        (member.email ? member.email.split("@")[0] : "") ||
        "Member"
    );
}

function getInitials(member) {
    const nameSource =
        member.full_name ||
        member.name ||
        member.username ||
        (member.email ? member.email.split("@")[0] : "");

    if (!nameSource) return "?";
    const words = nameSource.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

export const TeamMembersCard = ({members, deptId, autoFetch = true}) => {
    const shouldFetch = autoFetch && !members;

    const {
        data,
        isLoading,
        isError,
        error,
        deptId: detectedDeptId,
    } = useDeptMembers(shouldFetch ? deptId : undefined);

    const list = members ?? data ?? [];
    const finalDeptId = deptId ?? detectedDeptId;

    const {
        data: deptName,
        isLoading: deptLoading,
        isError: deptError,
    } = useDepartmentName(finalDeptId);

    return (
        <Card
            className={`
        p-6 rounded-2xl border border-slate-200 shadow-md
        bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-50
        transition-all duration-300 hover:shadow-lg
      `}
        >
            {/* Header with new icon */}
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users2 className="h-5 w-5 text-indigo-600"/> {/* 👈 Clean, professional Lucide icon */}
                Team Members
            </h2>

            {isLoading && (
                <div className="space-y-3">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="h-9 w-9 rounded-full bg-slate-200"/>
                            <div className="flex-1 space-y-1">
                                <div className="h-3 w-40 bg-slate-200 rounded"/>
                                <div className="h-3 w-56 bg-slate-200 rounded"/>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isError && !isLoading && (
                <p className="text-sm text-destructive">
                    Failed to load members
                    {error?.message ? `: ${error.message}` : ""}.
                </p>
            )}

            {!isLoading && !isError && (
                <div
                    className={`
            space-y-3 max-h-72 overflow-y-auto pr-1
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-transparent
          `}
                >
                    {list.map((m, idx) => {
                        const displayName = getDisplayName(m);
                        const initials = getInitials(m);

                        return (
                            <div
                                key={`${m.email || displayName || idx}-${idx}`}
                                className={`
                  flex items-center gap-3 rounded-xl p-2 transition-all duration-200
                  hover:bg-white/60 hover:shadow-sm hover:scale-[1.01]
                `}
                            >
                                <Avatar className="h-9 w-9 shadow-sm">
                                    <AvatarFallback
                                        className="bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">
                                        {displayName}
                                    </p>
                                    {m.email && (
                                        <p className="text-xs text-slate-600">{m.email}</p>
                                    )}
                                    {m.phone && (
                                        <p className="text-xs text-slate-600">{m.phone}</p>
                                    )}
                                </div>

                                {finalDeptId && (
                                    <span
                                        className={`
                      text-[11px] px-2 py-1 rounded-lg font-medium
                      bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700
                      border border-indigo-200 shadow-inner
                    `}
                                    >
                    {deptLoading
                        ? "Loading..."
                        : deptError
                            ? `Dept #${finalDeptId}`
                            : deptName || `Dept #${finalDeptId}`}
                  </span>
                                )}
                            </div>
                        );
                    })}

                    {list.length === 0 && (
                        <p className="text-sm text-slate-500">
                            No members found for this department.
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
};
