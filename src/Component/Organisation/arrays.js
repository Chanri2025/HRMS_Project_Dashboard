export const safeArray = (v) => (Array.isArray(v) ? v : []);
export const toArray = (v) => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);
export const SENTINEL_ALL = "__all__";
