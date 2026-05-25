export const normalizeRole = (role?: string | null) =>
  typeof role === "string" ? role.trim().toLowerCase() : "";

export const isAdminRole = (role?: string | null) =>
  normalizeRole(role) === "admin";

export const isUserRole = (role?: string | null) =>
  normalizeRole(role) === "user";

export const isOrganizerRole = (role?: string | null) =>
  normalizeRole(role) === "organizer";
