import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BusinessLogo } from "./BusinessLogo";
import { ORDER_STATUS } from "../constants/orderStatus";
import { formatMoney, formatOrderId, formatOrderStatus, formatShortDate } from "../utils/formatters";
import { useAppStyles, radii, spacing, typography } from "../theme";

export function OrderCard({ order, onPress }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const visibleItems = (order.items || []).slice(0, 3);
  const extraItems = Math.max(0, (order.items?.length || 0) - visibleItems.length);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver pedido ${order.id}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <BusinessLogo logoUrl={order.businessLogoUrl} name={order.businessName} size={56} />
        <View style={styles.heading}>
          <Text style={[styles.status, order.status === ORDER_STATUS.DELIVERED && styles.delivered, order.status === ORDER_STATUS.CANCELLED && styles.cancelled]}>{formatOrderStatus(order.status)} · {formatShortDate(order.createdAt)}</Text>
          <Text numberOfLines={1} style={styles.business}>{order.businessName || "Emprendimiento"}</Text>
          <Text style={styles.total}>{formatMoney(order.subtotal)}</Text>
        </View>
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
        <Text style={styles.id}>{formatOrderId(order.id)}</Text>
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
  heading: { flex: 1, gap: 4, minWidth: 0 },
  status: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
  delivered: { color: colors.success },
  cancelled: { color: colors.danger },
  business: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  id: { flex: 1, color: colors.muted, fontSize: 10 },
  items: { gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  itemRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  itemName: { flex: 1, color: colors.muted, fontSize: typography.caption, lineHeight: 19 },
  itemAmount: { color: colors.ink, fontSize: typography.caption, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: typography.caption },
  total: { color: colors.ink, fontSize: typography.body, fontWeight: "800", marginTop: spacing.sm },
});
