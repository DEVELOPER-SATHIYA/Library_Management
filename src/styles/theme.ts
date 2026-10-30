export const theme = {
  colors: {
    bg: "#f4f6fb",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    text: "#0f172a",
    textMuted: "#64748b",
    textSubtle: "#94a3b8",

    primary: "#4338ca",
    primaryHover: "#3730a3",
    primarySoft: "#eef2ff",

    sidebar: "#111827",
    sidebarHover: "#1f2937",
    sidebarText: "#cbd5e1",
    sidebarMuted: "#6b7280",

    success: "#15803d",
    successSoft: "#dcfce7",
    warning: "#b45309",
    warningSoft: "#fef3c7",
    danger: "#b91c1c",
    dangerSoft: "#fee2e2",
    info: "#0369a1",
    infoSoft: "#e0f2fe",
    neutralSoft: "#f1f5f9",
  },
  radius: { sm: "6px", md: "10px", lg: "14px", pill: "999px" },
  shadow: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 4px 14px rgba(15, 23, 42, 0.08)",
    lg: "0 20px 50px rgba(15, 23, 42, 0.22)",
  },
  font: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
  sidebarWidth: "264px",
  headerHeight: "64px",
  breakpoints: { md: "900px", sm: "600px" },
} as const;

export type AppTheme = typeof theme;
