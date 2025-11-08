// Date/time helpers for ProjectHeader

// Supports:
// - ISO: "2025-11-05T09:30:26.328000"
// - Old: "05-Nov-2025 03:00:26 PM" (for backward compatibility)
// All outputs are shifted +5h30m (IST)
export function parseCreatedOn(dateStr) {
    if (!dateStr) return null;

    let parsedDate = null;

    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
        parsedDate = dateStr;
    } else if (typeof dateStr === "string") {
        // Try ISO or native parse
        const iso = new Date(dateStr);
        if (!isNaN(iso.getTime())) {
            parsedDate = iso;
        } else {
            // Fallback: "DD-Mon-YYYY HH:MM:SS AM/PM"
            const [datePart, timePart, meridiem] = dateStr.split(" ");
            if (datePart) {
                const [dd, monStr, yyyy] = datePart.split("-");
                const months = {
                    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
                };
                const month = months[monStr];
                if (month !== undefined) {
                    let h = 0, m = 0, s = 0;
                    if (timePart) {
                        const parts = timePart.split(":");
                        h = Number(parts[0] || 0);
                        m = Number(parts[1] || 0);
                        s = Number(parts[2] || 0);
                    }
                    const mer = (meridiem || "").toUpperCase();
                    if (mer === "PM" && h < 12) h += 12;
                    if (mer === "AM" && h === 12) h = 0;

                    parsedDate = new Date(Number(yyyy), month, Number(dd), h, m, s);
                }
            }
        }
    }

    // If successfully parsed, apply +5:30 hours offset (IST)
    if (parsedDate && !isNaN(parsedDate.getTime())) {
        const adjusted = new Date(parsedDate.getTime() + (5.5 * 60 * 60 * 1000));
        return adjusted;
    }

    return null;
}

// ✅ Days elapsed from created_on till now
export function calcDaysElapsed(start) {
    if (!start) return null;
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
}

// ✅ Add days to a given date
export function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
}

// ✅ Format a date range like "Nov 5 - Dec 10, 2025"
export function formatRange(start, end) {
    if (!start || !end) return null;

    const startOpts = {month: "short", day: "numeric"};
    const endOpts = {month: "short", day: "numeric", year: "numeric"};

    const startStr = start.toLocaleDateString(undefined, startOpts);
    const endStr = end.toLocaleDateString(undefined, endOpts);
    return `${startStr} - ${endStr}`;
}

// ✅ Days remaining until a given date (0 if past)
export function calcDaysRemaining(end) {
    if (!end) return null;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}
