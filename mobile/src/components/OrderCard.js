import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusBadge } from "./StatusBadge";
import { formatDate, formatMoney } from "../utils/formatters";
import { colors, radii, shadows, spacing, typography } from "../theme";

export function OrderCard({ order, onPress }) {
  const units = order.items.reduce((total, item) => total + item.quantity, 0);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver pedido ${order.id}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.icon}><Ionicons name="receipt-outline" size={23} color={colors.primary} /></View>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.business}>{order.businessName}</Text>
          <Text style={styles.id}>#{order.id.replace("order_", "")}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>
      <View style={styles.divider} />
      <View style={styles.footer}>
        <View><Text style={styles.meta}>{formatDate(order.createdAt)}</Text><Text style={styles.meta}>{units} {units === 1 ? "producto" : "productos"}</Text></View>
        <Text style={styles.total}>{formatMoney(order.subtotal)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  pressed: { opacity: 0.82 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.primarySoft },
  heading: { flex: 1, gap: 2 },
  business: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  id: { color: colors.muted, fontSize: typography.caption },
  divider: { height: 1, backgroundColor: colors.border },
  footer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  meta: { color: colors.muted, fontSize: typography.caption, lineHeight: 19 },
  total: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
});
