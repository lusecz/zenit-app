export const isValidName = (s: string, min = 2, max = 120) => {
if (!s) return false;
const cleaned = s.trim();
return cleaned.length >= min && cleaned.length <= max;
};


export const sanitizeNumber = (v: any, fallback = 0) => {
const n = Number(v);
if (isNaN(n) || !isFinite(n)) return fallback;
return n < 0 ? fallback : n;
};