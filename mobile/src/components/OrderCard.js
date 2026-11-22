import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusBadge } from "./StatusBadge";
import { formatDate, formatMoney, formatOrderId } from "../utils/formatters";
import { useAppStyles, radii, spacing, typography } from "../theme";

export function OrderCard({ order, onPress }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const visibleItems = (order.items || []).slice(0, 3);
  const extraItems = Math.max(0, (order.items?.length || 0) - visibleItems.length);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver pedido ${order.id}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.icon}><Ionicons name="storefront-outline" size={24} color={colors.muted} /></View>
        <View style={styles.heading}>
          <StatusBadge status={order.status} />
          <Text numberOfLines={1} style={styles.business}>{order.businessName || "Emprendimiento"}</Text>
          <Text style={styles.id}>{formatDate(order.createdAt)} · {formatOrderId(order.id)}</Text>
        </View>
        <Text style={styles.total}>{formatMoney(order.subtotal)}</Text>
      </View>
      <View style={styles.items}>
        {visibleItems.map((item, index) => (
          <View key={`${item.productId}-${index}`} style={styles.itemRow}>
            <Text numberOfLines={2} style={styles.itemName}>{item.quantity} × {item.productName}</Text>
            <Text style={styles.itemAmount}>{formatMoney(item.lineTotal)}</Text>
          </View>
        ))}
        {extraItems > 0 && <Text style={styles.meta}>+ {extraItems} producto(s) más</Text>}
      </View>
      <View style={styles.footer}>
        <Text style={styles.link}>Ver pedido</Text>
        <Ionicons name="arrow-forward" size={17} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: { gap: spacing.lg, padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  pressed: { opacity: 0.82 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.subtle },
  heading: { flex: 1, gap: 4, minWidth: 0 },
  business: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  id: { color: colors.muted, fontSize: 11 },
  items: { gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  itemRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  itemName: { flex: 1, color: colors.muted, fontSize: typography.caption, lineHeight: 19 },
  itemAmount: { color: colors.ink, fontSize: typography.caption, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: spacing.xs },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: typography.caption },
  total: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
});
