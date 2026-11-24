export const lightColors = Object.freeze({
  primary: "#2563EB", primaryDark: "#1D4ED8", primarySoft: "#DBEAFE",
  ink: "#111827", muted: "#6B7280", background: "#F5F6F8", surface: "#FFFFFF",
  surfaceDark: "#192434", subtle: "#F3F4F6", border: "#E5E7EB",
  success: "#087443", successSoft: "#DCFCE7", warning: "#A15C00", warningSoft: "#FFF3D6",
  danger: "#B42318", dangerSoft: "#FEE4E2", white: "#FFFFFF", transparent: "transparent",
});

export const darkColors = Object.freeze({
  primary: "#2563EB", primaryDark: "#93C5FD", primarySoft: "#293548",
  ink: "#F3F4F6", muted: "#AEB8C7", background: "#111827", surface: "#1F2937",
  surfaceDark: "#192434", subtle: "#293548", border: "#475569",
  success: "#86EFAC", successSoft: "#143526", warning: "#FDE68A", warningSoft: "#422F13",
  danger: "#FCA5A5", dangerSoft: "#451A1A", white: "#FFFFFF", transparent: "transparent",
});

export function getColors(scheme) {
  return scheme === "dark" ? darkColors : lightColors;
}
