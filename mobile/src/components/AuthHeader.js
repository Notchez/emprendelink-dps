import { StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "./BrandLockup";
import { colors, spacing, typography } from "../theme";

export function AuthHeader({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.wrapper}>
      <BrandLockup />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xxl, marginTop: spacing.lg },
  copy: { gap: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: typography.hero, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 23 },
});
