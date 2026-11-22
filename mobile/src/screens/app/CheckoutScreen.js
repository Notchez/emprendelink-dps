import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { ScreenContainer } from "../../components/ScreenContainer";
import { EmptyState } from "../../components/StateView";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrdersContext";
import { useAppStyles, radii, spacing, typography } from "../../theme";
import { formatMoney } from "../../utils/formatters";
import { validateDelivery } from "../../utils/validation";

export function CheckoutScreen({ navigation }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const { user } = useAuth();
  const { business, items, subtotal, totalItems, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [address, setAddress] = useState(user?.address || "");
  const [notes, setNotes] = useState(user?.deliveryInstructions || "");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  async function confirmOrder() {
    if (submitting.current || !business || items.length === 0) return;
    const nextErrors = validateDelivery({ address, notes });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    submitting.current = true;
    setSaving(true);
    setMessage("");
    try {
      const order = await placeOrder({ business, items, deliveryAddress: address.trim(), notes: notes.trim() });
      clearCart();
      navigation.replace("OrderConfirmation", { order });
    } catch (failure) {
      setMessage(failure instanceof Error ? failure.message : "No se pudo confirmar tu pedido.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return <ScreenContainer safeEdges={["left", "right", "bottom"]}>
      <EmptyState title="Tu carrito está vacío" message="Agrega productos antes de confirmar un pedido." icon="cart-outline" actionLabel="Explorar negocios" onAction={() => navigation.navigate("MainTabs", { screen: "Businesses" })} />
    </ScreenContainer>;
  }

  return (
    <ScreenContainer scroll keyboard contentStyle={styles.page} safeEdges={["left", "right", "bottom"]}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>FINALIZAR COMPRA</Text>
        <Text style={styles.title}>Confirmar pedido</Text>
        <Text style={styles.muted}>Revisa tu compra y confirma dónde deseas recibirla.</Text>
        <Pressable accessibilityRole="link" onPress={() => navigation.navigate("Cart")} style={styles.linkRow}>
          <Ionicons name="chevron-back" size={17} color={colors.primary} />
          <Text style={styles.link}>Volver al carrito</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <SectionHeading step="1" title="Datos de entrega" subtitle="Esta información permitirá coordinar la entrega de tu pedido." />
        <View style={styles.contactCard}><Text style={styles.contactCaption}>Nombre</Text><Text style={styles.contactValue}>{user?.name || "No registrado"}</Text></View>
        <View style={styles.contactCard}><Text style={styles.contactCaption}>Correo electrónico</Text><Text style={styles.contactValue}>{user?.email || "No registrado"}</Text></View>
        <View style={styles.contactCard}><Text style={styles.contactCaption}>Teléfono</Text><Text style={styles.contactValue}>{user?.phone || "No registrado"}</Text></View>
        <Pressable accessibilityRole="link" onPress={() => navigation.navigate("MainTabs", { screen: "Profile" })}>
          <Text style={styles.link}>Editar mis datos personales →</Text>
        </Pressable>
        <AppInput label="Dirección para este pedido" multiline numberOfLines={3} textAlignVertical="top" value={address} maxLength={500} onChangeText={(value) => { setAddress(value); setErrors((current) => ({ ...current, address: "" })); }} error={errors.address} placeholder="Colonia, calle, número de casa y referencias..." editable={!saving} />
        <Text style={styles.help}>Puedes utilizar una dirección diferente de la guardada en tu perfil.</Text>
        <AppInput label="Indicaciones de entrega (opcional)" multiline numberOfLines={3} textAlignVertical="top" value={notes} maxLength={500} onChangeText={(value) => { setNotes(value); setErrors((current) => ({ ...current, notes: "" })); }} error={errors.notes} placeholder="Ej.: portón azul, llamar al llegar..." editable={!saving} />
      </View>

      <View style={styles.panel}>
        <SectionHeading step="2" title="Método de pago" subtitle="Así realizarás el pago de esta compra." />
        <View style={styles.payment}>
          <Ionicons name="cash-outline" size={26} color={colors.ink} />
          <View style={styles.paymentCopy}><Text style={styles.paymentTitle}>Pago contra entrega</Text><Text style={styles.muted}>Pagarás al recibir tu pedido. No necesitas ingresar datos de tarjeta.</Text></View>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Resumen de tu pedido</Text>
        <Text style={styles.muted}>Comprueba los productos antes de confirmar tu compra.</Text>
        {items.map((item) => <View key={item.id} style={styles.product}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" accessibilityLabel={`Imagen de ${item.name}`} /> : <View style={styles.productFallback}><Ionicons name="image-outline" size={22} color={colors.muted} /></View>}
          <View style={styles.productInfo}><Text style={styles.productName}>{item.name}</Text><Text style={styles.muted}>{item.quantity} × {formatMoney(item.price)}</Text><Text style={styles.productName}>{formatMoney(item.price * item.quantity)}</Text></View>
        </View>)}
        <Pressable accessibilityRole="link" onPress={() => navigation.navigate("Cart")}><Text style={styles.link}>Modificar productos o cantidades →</Text></Pressable>
        <View style={styles.summaryRow}><Text style={styles.muted}>Productos</Text><Text style={styles.productName}>{totalItems}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.sectionTitle}>Total estimado</Text><Text style={styles.sectionTitle}>{formatMoney(subtotal)}</Text></View>
        <Text style={styles.help}>El total definitivo se calculará con los precios vigentes al registrar tu pedido.</Text>
        <View style={styles.linkRow}><Ionicons name="checkmark-circle-outline" size={19} color={colors.success} /><Text style={styles.muted}>Pagarás contra entrega.</Text></View>
        {message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null}
        <AppButton title={saving ? "Registrando pedido..." : "Confirmar pedido"} loading={saving} onPress={() => void confirmOrder()} />
        <Text style={styles.help}>Al confirmar, tu pedido será enviado al emprendimiento para que pueda gestionarlo.</Text>
      </View>
    </ScreenContainer>
  );
}

function SectionHeading({ step, title, subtitle }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.sectionHeading}>
    <View style={styles.step}><Text style={styles.stepText}>{step}</Text></View>
    <View style={styles.sectionCopy}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View>
  </View>;
}

const makeStyles = (colors) => StyleSheet.create({
  page: { gap: spacing.lg, padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  heading: { gap: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: typography.caption, lineHeight: 20 },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  panel: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  sectionHeading: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, marginBottom: spacing.sm },
  sectionCopy: { flex: 1, gap: spacing.xs },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  step: { width: 34, height: 34, borderRadius: radii.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  stepText: { color: colors.white, fontWeight: "900" },
  contactCard: { gap: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.subtle },
  contactCaption: { color: colors.muted, fontSize: typography.caption },
  contactValue: { color: colors.ink, fontSize: typography.body, fontWeight: "700" },
  help: { color: colors.muted, fontSize: typography.tiny, lineHeight: 17 },
  payment: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.md, borderWidth: 2, borderColor: colors.primary, borderRadius: radii.md, backgroundColor: colors.subtle },
  paymentCopy: { flex: 1, gap: spacing.xs },
  paymentTitle: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  product: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border },
  productImage: { width: 64, height: 64, borderRadius: radii.md },
  productFallback: { width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.subtle },
  productInfo: { flex: 1, gap: 2 },
  productName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderColor: colors.border },
  error: { color: colors.danger, padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.dangerSoft },
});
