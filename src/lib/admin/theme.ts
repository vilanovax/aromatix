export const ADMIN_THEME_KEY = "aroma-admin-theme";

export type AdminTheme = "light" | "dark";

export function readAdminTheme(): AdminTheme {
  if (typeof document !== "undefined") {
    const current = document.documentElement.dataset.adminTheme;
    if (current === "light" || current === "dark") return current;
  }
  try {
    const stored = localStorage.getItem(ADMIN_THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode */
  }
  return "dark";
}

export function applyAdminTheme(theme: AdminTheme) {
  document.documentElement.dataset.adminTheme = theme;
  try {
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  } catch {
    /* private mode */
  }
}
