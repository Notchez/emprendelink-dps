export const colors = Object.freeze({
  primary: "#2563EB",
  primaryDark: "#93C5FD",
  primarySoft: "#293548",
  ink: "#F3F4F6",
  muted: "#AEB8C7",
  background: "#111827",
  surface: "#1F2937",
  surfaceDark: "#192434",
  subtle: "#293548",
  border: "#475569",
  success: "#86EFAC",
  successSoft: "#143526",
  warning: "#FDE68A",
  warningSoft: "#422F13",
  danger: "#FCA5A5",
  dangerSoft: "#451A1A",
  white: "#FFFFFF",
  transparent: "transparent",
});

export const spacing = Object.freeze({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 });
export const radii = Object.freeze({ sm: 8, md: 12, lg: 16, pill: 999 });
export const typography = Object.freeze({ hero: 32, title: 24, subtitle: 18, body: 15, caption: 13, tiny: 11 });

export const shadows = Object.freeze({
  card: {
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
});

export const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "800" },
  },
};
