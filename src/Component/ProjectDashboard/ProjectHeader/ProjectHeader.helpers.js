// Date/time helpers for ProjectHeader

export function parseCreatedOn(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;
    const [datePart, timePart, meridiem] = dateStr.split(" ");
    if (!datePart) return null;

    const [dd, monStr, yyyy] = datePart.split("-");
    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    const month = months[monStr];
    if (month === undefined) return null;

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

    return new Date(Number(yyyy), month, Number(dd), h, m, s);
}

export function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
}

export function formatRange(start, end) {
    if (!start || !end) return null;

    const startOpts = {month: "short", day: "numeric"};
    const endOpts = {month: "short", day: "numeric", year: "numeric"};

    const startStr = start.toLocaleDateString(undefined, startOpts);
    const endStr = end.toLocaleDateString(undefined, endOpts);
    return `${startStr} - ${endStr}`;
}

export function calcDaysRemaining(end) {
    if (!end) return null;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}
