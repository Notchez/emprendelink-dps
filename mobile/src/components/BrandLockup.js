import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../theme";

export function BrandLockup({ compact = false }) {
  return (
    <View style={styles.row} accessibilityLabel="EmprendeLink">
      <View style={[styles.icon, compact && styles.iconCompact]}>
        <Ionicons name="storefront" size={compact ? 18 : 23} color={colors.white} />
      </View>
      <Text style={[styles.brand, compact && styles.brandCompact]}><Text style={styles.accent}>Emprende</Text>Link</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.primary },
  iconCompact: { width: 34, height: 34, borderRadius: radii.sm },
  brand: { color: colors.ink, fontSize: 25, fontWeight: "800", letterSpacing: -0.8 },
  brandCompact: { fontSize: 20 },
  accent: { color: colors.primary },
});
