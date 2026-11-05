import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ErrorState, LoadingState } from "../../components/StateView";
import { ScreenContainer } from "../../components/ScreenContainer";
import { StatusBadge } from "../../components/StatusBadge";
import { orderService } from "../../services/orderService";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import { formatDate, formatMoney } from "../../utils/formatters";

export function OrderDetailScreen({ route }) {
  const orderId = route.params?.order?.id || route.params?.orderId;
  const [order, setOrder] = useState(route.params?.order || null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [orderResult, historyResult] = await Promise.all([
      orderService.getOrderById(orderId),
      orderService.getOrderHistory(orderId),
    ]);
    if (!orderResult.success) setError(orderResult.error?.message || "No se pudo cargar el pedido.");
    else setOrder(orderResult.data);
    if (historyResult.success) setHistory(historyResult.data);
    else if (orderResult.success) setError(historyResult.error?.message || "No se pudo cargar el historial.");
    setLoading(false);
  }, [orderId]);

  useEffect(() => { void load(); }, [load]);

  if (loading && !order) return <LoadingState message="Cargando pedido..." />;
  if (error && !order) return <ErrorState message={error} onRetry={load} />;
  if (!order) return <ErrorState message="El pedido no está disponible." onRetry={load} />;

  return (
    <ScreenContainer scroll contentStyle={styles.page} safeEdges={["left", "right"]}>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons name="receipt-outline" size={30} color={colors.primary} /></View>
        <Text style={styles.eyebrow}>PEDIDO</Text>
        <Text style={styles.title}>#{order.id.replace("order_", "")}</Text>
        <Text style={styles.business}>{order.businessName || "Emprendimiento"}</Text>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Productos</Text>
        {order.items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <View style={styles.itemCopy}><Text style={styles.itemName}>{item.productName}</Text><Text style={styles.itemMeta}>{item.quantity} × {formatMoney(item.unitPrice)}</Text></View>
            <Text style={styles.itemTotal}>{formatMoney(item.lineTotal)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.total}>{formatMoney(order.subtotal)}</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <InfoRow icon="calendar-outline" label="Fecha" value={formatDate(order.createdAt)} />
        <InfoRow icon="location-outline" label="Dirección" value={order.deliveryAddress} />
        <InfoRow icon="chatbox-ellipses-outline" label="Indicaciones" value={order.notes || "Sin indicaciones adicionales"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historial</Text>
        {history.map((event, index) => (
          <View key={`${event.changedAt}-${index}`} style={styles.historyRow}>
            <StatusBadge status={event.newStatus} />
            <Text style={styles.historyDate}>{formatDate(event.changedAt)}</Text>
          </View>
        ))}
        {!loading && history.length === 0 ? <Text style={styles.itemMeta}>No hay movimientos registrados.</Text> : null}
      </View>
    </ScreenContainer>
  );
}

function InfoRow({ icon, label, value }) {
  return <View style={styles.infoRow}><View style={styles.infoIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View><View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
  error: { padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.dangerSoft, color: colors.danger },
  hero: { alignItems: "center", gap: spacing.sm, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  heroIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  business: { color: colors.muted, fontSize: typography.body },
  card: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "900" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border },
  itemCopy: { flex: 1, gap: 2 }, itemName: { color: colors.ink, fontSize: typography.body, fontWeight: "700" }, itemMeta: { color: colors.muted, fontSize: typography.caption }, itemTotal: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing.sm }, totalLabel: { color: colors.muted, fontSize: typography.body }, total: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md }, infoIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.primarySoft }, infoCopy: { flex: 1, gap: 2 }, infoLabel: { color: colors.muted, fontSize: typography.tiny, fontWeight: "700", textTransform: "uppercase" }, infoValue: { color: colors.ink, fontSize: typography.body, lineHeight: 21 },
  historyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }, historyDate: { color: colors.muted, fontSize: typography.caption },
});
