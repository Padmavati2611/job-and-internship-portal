export const JOB_TYPE_LABELS = {
  job: "Full-time",
  internship: "Internship",
};

export const WORK_MODE_LABELS = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export const EXPERIENCE_LABELS = {
  fresher: "Fresher",
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
};

export const APPLICATION_STATUSES = [
  "Pending",
  "Shortlisted",
  "Rejected",
  "Selected",
];

const DATE_FORMAT = { day: "numeric", month: "short", year: "numeric" };

export function formatDate(value, options = DATE_FORMAT) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", options);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function daysUntil(value) {
  if (!value) return null;
  const deadline = new Date(`${value}T23:59:59`);
  if (Number.isNaN(deadline.getTime())) return null;
  const today = new Date();
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(value) {
  const days = daysUntil(value);
  if (days === null) return "Open until filled";
  if (days < 0) return "Applications closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const COMPANY_PALETTE = [
  ["#dbeafe", "#1d4ed8"],
  ["#dcfce7", "#15803d"],
  ["#fef3c7", "#b45309"],
  ["#fce7f3", "#be185d"],
  ["#ede9fe", "#6d28d9"],
  ["#cffafe", "#0e7490"],
  ["#ffedd5", "#c2410c"],
  ["#e0e7ff", "#4338ca"],
];

export function companyColor(name = "") {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  const [background, color] =
    COMPANY_PALETTE[Math.abs(hash) % COMPANY_PALETTE.length];
  return { background, color };
}

export function profileCompletion(profile) {
  if (!profile) return 0;
  if (typeof profile.completion === "number") return profile.completion;
  return 0;
}

export function getInitialsColor(name) {
  return companyColor(name);
}

export function truncate(text = "", length = 160) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
}

export function splitSkills(skills) {
  if (!skills) return [];
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}
