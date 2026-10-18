import { useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { EmptyState } from "../../components/StateView";
import { QuantityControl } from "../../components/QuantityControl";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrdersContext";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import { formatMoney } from "../../utils/formatters";

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
      const order = await placeOrder({ business, items, subtotal });
      clearCart();
      Alert.alert("Pedido creado", `Tu pedido ${order.id.replace("order_", "#")} quedó pendiente.`, [
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
          <View style={styles.header}>
            <View><Text style={styles.eyebrow}>TU COMPRA</Text><Text style={styles.title}>{business?.name}</Text><Text style={styles.subtitle}>{totalItems} {totalItems === 1 ? "producto" : "productos"}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Vaciar carrito" onPress={requestClear} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} accessibilityLabel={`Imagen de ${item.name}`} />
            <View style={styles.itemBody}>
              <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatMoney(item.price)} c/u</Text>
              <View style={styles.itemActions}>
                <QuantityControl value={item.quantity} onChange={(quantity) => updateQuantity(item.id, quantity)} />
                <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} hitSlop={8} onPress={() => removeItem(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.lineTotal}>{formatMoney(item.price * item.quantity)}</Text>
          </View>
        )}
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text></View>
        <Text style={styles.notice}>Demostración académica: el pedido se guarda temporalmente en memoria.</Text>
        <AppButton title="Confirmar pedido" onPress={() => void confirmOrder()} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  emptyPage: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: typography.caption },
  clearButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.dangerSoft },
  separator: { height: spacing.md },
  item: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  itemImage: { width: 72, height: 72, borderRadius: radii.md, backgroundColor: colors.background },
  itemBody: { flex: 1, gap: spacing.xs },
  itemName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  itemPrice: { color: colors.muted, fontSize: typography.caption },
  itemActions: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  lineTotal: { color: colors.ink, fontSize: typography.caption, fontWeight: "800" },
  summary: { gap: spacing.md, padding: spacing.lg, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLabel: { color: colors.muted, fontSize: typography.body },
  summaryValue: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  notice: { color: colors.muted, fontSize: typography.tiny, lineHeight: 16 },
});
