import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

export function AppButton({ title, onPress, loading = false, disabled = false, variant = "primary", icon, accessibilityHint }) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && !inactive && styles.pressed, inactive && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? colors.white : colors.primary} /> : icon}
      <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: "#BFDBFE" },
  ghost: { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.white, fontSize: typography.body, fontWeight: "800" },
  secondaryLabel: { color: colors.primaryDark },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
