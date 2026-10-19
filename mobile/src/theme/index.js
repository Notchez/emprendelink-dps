export const colors = Object.freeze({
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#DBEAFE",
  ink: "#162033",
  muted: "#667085",
  background: "#F4F7FB",
  surface: "#FFFFFF",
  surfaceDark: "#192434",
  border: "#E2E8F0",
  success: "#087443",
  successSoft: "#DCFCE7",
  warning: "#A15C00",
  warningSoft: "#FFF3D6",
  danger: "#B42318",
  dangerSoft: "#FEE4E2",
  white: "#FFFFFF",
  transparent: "transparent",
});

export const spacing = Object.freeze({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 });
export const radii = Object.freeze({ sm: 8, md: 12, lg: 18, pill: 999 });
export const typography = Object.freeze({ hero: 32, title: 24, subtitle: 18, body: 15, caption: 13, tiny: 11 });

export const shadows = Object.freeze({
  card: {
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
});

export const navigationTheme = {
  dark: false,
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
