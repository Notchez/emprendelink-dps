import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { getColors } from "./palette.js";

export { getColors, lightColors, darkColors } from "./palette.js";

export function useAppTheme() {
  const scheme = useColorScheme();
  return { colors: getColors(scheme), dark: scheme === "dark" };
}

export function useAppStyles(makeStyles) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [makeStyles, colors]);
  return { colors, styles };
}

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

export function getNavigationTheme(scheme) {
  const colors = getColors(scheme);
  return {
    dark: scheme === "dark",
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
}
