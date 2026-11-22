import { useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { EmptyState } from "../../components/StateView";
import { QuantityControl } from "../../components/QuantityControl";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrdersContext";
import { colors, radii, spacing, typography } from "../../theme";
import { formatMoney, formatOrderId } from "../../utils/formatters";

export function CartScreen({ navigation }) {
  const { items, business, subtotal, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [saving, setSaving] = useState(false);

  function requestClear() {
    Alert.alert("Vaciar carrito", "¿Deseas eliminar todos los productos?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Vaciar", style: "destructive", onPress: clearCart },
    ]);
  }

  async function confirmOrder() {
    if (!business || items.length === 0) return;
    setSaving(true);
    try {
      const order = await placeOrder({ business, items });
      clearCart();
      Alert.alert("Pedido creado", `Tu pedido ${formatOrderId(order.id)} quedó pendiente.`, [
        { text: "Ver pedidos", onPress: () => navigation.navigate("MainTabs", { screen: "Orders" }) },
      ]);
    } catch (failure) {
      Alert.alert("No se pudo confirmar", failure instanceof Error ? failure.message : "Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.emptyPage}>
        <EmptyState
          title="Tu carrito está vacío"
          message="Explora los negocios y agrega productos para comenzar un pedido."
          icon="cart-outline"
          actionLabel="Explorar negocios"
          onAction={() => navigation.navigate("MainTabs", { screen: "Businesses" })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.headingGroup}>
            <View style={styles.header}>
              <View><Text style={styles.eyebrow}>TU COMPRA</Text><Text style={styles.title}>Carrito</Text><Text style={styles.subtitle}>{totalItems} {totalItems === 1 ? "producto" : "productos"}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Vaciar carrito" onPress={requestClear} style={styles.clearButton}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
            <View style={styles.businessRow}>
              <View style={styles.businessIcon}><Ionicons name="storefront-outline" size={22} color={colors.muted} /></View>
              <View style={styles.businessCopy}><Text style={styles.businessCaption}>Emprendimiento</Text><Text numberOfLines={1} style={styles.businessName}>{business?.name}</Text></View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="contain" accessibilityLabel={`Imagen de ${item.name}`} />
            ) : (
              <View style={styles.itemImageFallback}><Ionicons name="image-outline" size={26} color={colors.muted} /></View>
            )}
            <View style={styles.itemBody}>
              <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatMoney(item.price)} c/u</Text>
              <Text style={styles.lineTotal}>{formatMoney(item.price * item.quantity)}</Text>
              <View style={styles.itemActions}>
                <QuantityControl value={item.quantity} onChange={(quantity) => updateQuantity(item.id, quantity)} />
                <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} hitSlop={8} onPress={() => removeItem(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text></View>
        <Text style={styles.notice}>El servidor verificará productos, precios y disponibilidad antes de crear el pedido.</Text>
        <AppButton title="Confirmar pedido" onPress={() => void confirmOrder()} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  emptyPage: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  headingGroup: { gap: spacing.lg, marginBottom: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: typography.caption },
  clearButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.dangerSoft },
  businessRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  businessIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.subtle },
  businessCopy: { flex: 1, gap: spacing.xs },
  businessCaption: { color: colors.muted, fontSize: typography.tiny },
  businessName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  separator: { height: spacing.md },
  item: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  itemImage: { width: 76, height: 76, borderRadius: radii.md, backgroundColor: colors.subtle },
  itemImageFallback: { width: 76, height: 76, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.subtle },
  itemBody: { flex: 1, gap: spacing.xs },
  itemName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  itemPrice: { color: colors.muted, fontSize: typography.caption },
  itemActions: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  lineTotal: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  summary: { gap: spacing.md, padding: spacing.lg, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLabel: { color: colors.muted, fontSize: typography.body },
  summaryValue: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  notice: { color: colors.muted, fontSize: typography.tiny, lineHeight: 16 },
});
