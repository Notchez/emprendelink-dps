import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { BusinessLogo } from "../../components/BusinessLogo";
import { EmptyState } from "../../components/StateView";
import { QuantityControl } from "../../components/QuantityControl";
import { useCart } from "../../context/CartContext";
import { useAppStyles, radii, spacing, typography } from "../../theme";
import { formatMoney } from "../../utils/formatters";

export function CartScreen({ navigation }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const { items, business, subtotal, totalItems, updateQuantity, removeItem, clearCart } = useCart();

  function requestClear() {
    Alert.alert("Vaciar carrito", "¿Deseas eliminar todos los productos?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Vaciar", style: "destructive", onPress: clearCart },
    ]);
  }

  function continueShopping() {
    if (business?.id) {
      navigation.navigate("Catalog", { businessId: business.id, businessName: business.name });
    } else {
      navigation.navigate("MainTabs", { screen: "Businesses" });
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.emptyPage}>
        <EmptyState
          title="Tu carrito está vacío"
          message="Explora los negocios y agrega productos para comenzar una compra."
          icon="cart-outline"
          actionLabel="Explorar negocios"
          onAction={() => navigation.navigate("MainTabs", { screen: "Businesses" })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>TU COMPRA</Text>
          <Text style={styles.title}>Carrito</Text>
          <Text style={styles.subtitle}>{totalItems} {totalItems === 1 ? "producto" : "productos"}</Text>
        </View>

        <View style={styles.productsCard}>
          <View style={styles.businessRow}>
            <BusinessLogo logoUrl={business?.logoUrl} name={business?.name} size={54} />
            <View style={styles.businessCopy}>
              <Text style={styles.businessCaption}>Pedido para</Text>
              <Text numberOfLines={2} style={styles.businessName}>{business?.name || "Emprendimiento"}</Text>
              <Pressable accessibilityRole="link" onPress={continueShopping} hitSlop={8}>
                <Text style={styles.inlineLink}>Seguir comprando</Text>
              </Pressable>
            </View>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemTop}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" accessibilityLabel={`Imagen de ${item.name}`} />
                ) : (
                  <View style={styles.itemImageFallback}><Ionicons name="image-outline" size={25} color={colors.muted} /></View>
                )}
                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatMoney(item.price)} c/u</Text>
                  <Pressable accessibilityRole="button" onPress={() => removeItem(item.id)} hitSlop={8}>
                    <Text style={styles.deleteLink}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.controls}>
                <QuantityControl minimum={0} value={item.quantity} onChange={(quantity) => updateQuantity(item.id, quantity)} />
                <Text style={styles.lineTotal}>{formatMoney(item.price * item.quantity)}</Text>
              </View>
            </View>
          ))}

          <Pressable accessibilityRole="button" onPress={requestClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Vaciar carrito</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Productos</Text><Text style={styles.summaryLabel}>{totalItems}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text></View>
          <View style={styles.payment}>
            <Ionicons name="cash-outline" size={24} color={colors.ink} />
            <View style={styles.paymentCopy}>
              <Text style={styles.paymentTitle}>Pago contra entrega</Text>
              <Text style={styles.paymentText}>Pagarás cuando recibas tu pedido.</Text>
            </View>
          </View>
          <AppButton title="Continuar" onPress={() => navigation.navigate("Checkout")} disabled={!business?.id || business?.active === false} />
          {business?.active === false && <Text style={styles.error}>Este negocio ya no está disponible.</Text>}
          <Pressable accessibilityRole="link" onPress={continueShopping} style={styles.continueLink}>
            <Text style={styles.inlineLink}>Seguir comprando</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  emptyPage: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  page: { gap: spacing.lg, padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  header: { gap: 4 },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: typography.body },
  productsCard: { padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  businessRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingBottom: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  businessCopy: { flex: 1, gap: 3 },
  businessCaption: { color: colors.muted, fontSize: typography.tiny },
  businessName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  inlineLink: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
  item: { gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  itemTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  itemImage: { width: 70, height: 70, borderRadius: radii.md, backgroundColor: colors.subtle },
  itemImageFallback: { width: 70, height: 70, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.subtle },
  itemBody: { flex: 1, gap: spacing.xs },
  itemName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  itemPrice: { color: colors.muted, fontSize: typography.caption },
  deleteLink: { color: colors.danger, fontSize: typography.caption },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  lineTotal: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  clearButton: { paddingTop: spacing.lg },
  clearText: { color: colors.danger, fontSize: typography.body, fontWeight: "800" },
  summaryCard: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  summaryTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "900" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  summaryLabel: { color: colors.muted, fontSize: typography.body },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.lg, borderTopWidth: 1, borderColor: colors.border },
  totalLabel: { color: colors.ink, fontSize: typography.body },
  summaryValue: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "900" },
  payment: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.subtle },
  paymentCopy: { flex: 1, gap: spacing.xs },
  paymentTitle: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  paymentText: { color: colors.muted, fontSize: typography.caption },
  continueLink: { alignItems: "center", paddingVertical: spacing.sm },
  error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: spacing.sm, borderRadius: radii.sm },
});
