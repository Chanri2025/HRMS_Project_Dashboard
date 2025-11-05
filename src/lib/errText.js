// Always convert API errors into a printable string (safe for toast/UI)
export function errText(err, fb = "Request failed") {
    const d = err?.response?.data?.detail;
    if (Array.isArray(d)) return d.map(x => x?.msg || JSON.stringify(x)).join("; ");
    if (typeof d === "string") return d;
    if (d && typeof d === "object") return JSON.stringify(d);
    return err?.response?.data?.message || err?.message || fb;
}
