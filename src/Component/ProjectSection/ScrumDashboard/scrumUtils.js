// src/Component/ProjectSection/ScrumDashboard/scrumUtils.js

// Status → badge classes
export const statusClassFor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "running") {
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (s === "paused") {
        return "bg-amber-100 text-amber-900 border-amber-200";
    }
    if (s === "completed" || s === "done") {
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
    return "bg-muted text-muted-foreground border-transparent";
};

// Convert (float) hours → "X h Y min"
export function formatHoursToHM(hours) {
    if (hours == null || Number.isNaN(hours)) return null;
    const totalMinutes = Math.round(Number(hours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
}
