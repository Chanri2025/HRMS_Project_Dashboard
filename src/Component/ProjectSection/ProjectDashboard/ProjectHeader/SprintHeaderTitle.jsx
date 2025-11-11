// src/Component/ProjectDashboard/ProjectHeader/SprintHeaderTitle.jsx
import React from "react";
import {Badge} from "@/components/ui/badge";
import {Calendar, User2, FolderKanban} from "lucide-react";

export function SprintHeaderTitle({
                                      loading,
                                      error,
                                      selectedProject,
                                      activeCount,
                                      createdByUser,
                                      createdOnLabel,
                                      daysElapsed,
                                  }) {
    const projectName = loading
        ? "Loading..."
        : error
            ? "Project Unavailable"
            : selectedProject?.name || "No Active Project";

    const rawStatus = selectedProject?.status || "Unknown";
    const statusLower = rawStatus.toLowerCase();

    const statusBadgeClass =
        statusLower === "active"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : statusLower === "completed"
                ? "bg-sky-50 text-sky-700 border border-sky-200"
                : statusLower === "on hold"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-50 text-slate-600 border border-slate-200";

    return (
        <div className="flex items-start gap-3 sm:gap-4">
            {/* Left accent icon */}
            <div
                className={`
          hidden sm:flex items-center justify-center
          h-10 w-10 rounded-2xl
          bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100
          text-sky-600 shadow-sm
        `}
            >
                <FolderKanban className="h-5 w-5"/>
            </div>

            {/* Main content */}
            <div className="flex flex-col gap-1.5 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <h2
                        className={`
              text-xl sm:text-2xl font-semibold tracking-tight
              text-slate-900
            `}
                    >
                        {projectName}
                    </h2>

                    {selectedProject && (
                        <Badge
                            variant="outline"
                            className={`
                ${statusBadgeClass}
                px-2.5 py-0.5 text-[10px] font-semibold rounded-full flex items-center gap-1
              `}
                        >
              <span
                  className={`
                  h-1.5 w-1.5 rounded-full
                  ${
                      statusLower === "active"
                          ? "bg-emerald-500"
                          : statusLower === "completed"
                              ? "bg-sky-500"
                              : statusLower === "on hold"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                  }
                `}
              />
                            {rawStatus}
                        </Badge>
                    )}

                    {activeCount > 1 && (
                        <Badge
                            variant="outline"
                            className={`
                text-[10px] font-medium
                bg-slate-50 text-slate-600 border-slate-200
                flex items-center gap-1
              `}
                        >
                            <FolderKanban className="h-3 w-3"/>
                            {activeCount} active projects
                        </Badge>
                    )}
                </div>

                {/* Meta row: created by + date + elapsed */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                    {createdByUser?.full_name && (
                        <span className="inline-flex items-center gap-1">
              <User2 className="h-3.5 w-3.5 text-sky-500"/>
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                Created by <span className="font-medium">{createdByUser.full_name}</span>
              </span>
            </span>
                    )}

                    {createdOnLabel ? (
                        <>
                            {createdByUser?.full_name && (
                                <span className="text-slate-400">•</span>
                            )}
                            <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500"/>
                <span>Created on {createdOnLabel}</span>
              </span>

                            {typeof daysElapsed === "number" && (
                                <>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500">
                    {daysElapsed} day{daysElapsed === 1 ? "" : "s"} elapsed
                  </span>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {createdByUser?.full_name && (
                                <span className="text-slate-400">•</span>
                            )}
                            <span className="inline-flex items-center gap-1 text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400"/>
                Created date not available
              </span>
                        </>
                    )}
                </div>

                {/* Description (single line clamp) */}
                {selectedProject?.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {selectedProject.description}
                    </p>
                )}
            </div>
        </div>
    );
}
