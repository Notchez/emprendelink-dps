import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAppStyles, radii, spacing, typography } from "../../theme";
import { formatMoney, formatOrderId, formatOrderStatus, formatShortDate } from "../../utils/formatters";

export function OrderConfirmationScreen({ navigation, route }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const order = route.params?.order;
  if (!order?.id) {
    return <ScreenContainer><AppButton title="Volver a mis pedidos" onPress={() => navigation.navigate("MainTabs", { screen: "Orders" })} /></ScreenContainer>;
  }

  return <ScreenContainer scroll contentStyle={styles.page} safeEdges={["left", "right", "bottom"]}>
    <View style={styles.card}>
      <View style={styles.hero}>
        <View style={styles.icon}><Ionicons name="checkmark" size={32} color={colors.success} /></View>
        <Text style={styles.eyebrow}>COMPRA REGISTRADA</Text>
        <Text style={styles.title}>¡Pedido recibido!</Text>
        <Text style={styles.muted}>Tu pedido se registró correctamente y ya fue enviado al emprendimiento.</Text>
        <Text style={styles.orderId}>{formatOrderId(order.id)}</Text>
        <Text style={styles.muted}>{formatShortDate(order.createdAt)}</Text>
      </View>
      <View style={styles.successBox}>
        <Text style={styles.successText}>Estado actual: {formatOrderStatus(order.status)}</Text>
        <Text style={styles.muted}>Puedes seguir el avance desde Mis pedidos.</Text>
      </View>
      <Text style={styles.sectionTitle}>Productos solicitados</Text>
      {(order.items || []).map((item, index) => <View key={`${item.productId}-${index}`} style={styles.row}>
        <Text style={styles.muted}>{item.quantity} × {item.productName}</Text><Text style={styles.amount}>{formatMoney(item.lineTotal)}</Text>
      </View>)}
      <View style={styles.row}><Text style={styles.sectionTitle}>Total del pedido</Text><Text style={styles.sectionTitle}>{formatMoney(order.subtotal)}</Text></View>
      <Text style={styles.sectionTitle}>Información de entrega</Text>
      <Text style={styles.muted}>{order.deliveryAddress}</Text>
      {order.notes ? <Text style={styles.muted}>Indicaciones: {order.notes}</Text> : null}
      <Text style={styles.sectionTitle}>Método de pago</Text>
      <Text style={styles.muted}>Pago contra entrega. Pagarás al recibir tu pedido.</Text>
      <AppButton title="Ver mi pedido" onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })} />
      <Pressable accessibilityRole="link" style={styles.linkButton} onPress={() => navigation.navigate("MainTabs", { screen: "Orders" })}>
        <Text style={styles.link}>Mis pedidos</Text>
      </Pressable>
      <Pressable accessibilityRole="link" style={styles.linkButton} onPress={() => navigation.navigate("MainTabs", { screen: "Businesses" })}>
        <Text style={styles.link}>Seguir comprando</Text>
      </Pressable>
    </View>
  </ScreenContainer>;
}

const makeStyles = (colors) => StyleSheet.create({
  page: { padding: spacing.md, paddingTop: spacing.xl },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  hero: { alignItems: "center", gap: spacing.sm },
  icon: { width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.successSoft },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 27, fontWeight: "900", textAlign: "center" },
  orderId: { color: colors.primary, fontSize: typography.subtitle, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: typography.caption, lineHeight: 20, flexShrink: 1 },
  successBox: { gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.successSoft },
  successText: { color: colors.success, fontSize: typography.body, fontWeight: "800" },
  sectionTitle: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.md },
  amount: { color: colors.ink, fontSize: typography.caption, fontWeight: "800" },
  linkButton: { padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  link: { color: colors.primary, fontSize: typography.body, fontWeight: "800" },
});
