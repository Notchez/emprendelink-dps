import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { QuantityControl } from "../../components/QuantityControl";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useCart } from "../../context/CartContext";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import { formatMoney } from "../../utils/formatters";

export function ProductDetailScreen({ navigation, route }) {
  const { product, business } = route.params;
  const { addItem, replaceWithItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);

  function finishAdd() {
    navigation.navigate("Cart");
  }

  function addToCart() {
    if (addItem(product, business, quantity)) {
      finishAdd();
      return;
    }
    Alert.alert(
      "Productos de otro negocio",
      "Para comprar aquí debes reemplazar el contenido actual del carrito.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reemplazar",
          style: "destructive",
          onPress: () => {
            replaceWithItem(product, business, quantity);
            finishAdd();
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer scroll contentStyle={styles.page} safeEdges={["left", "right"]}>
      <View style={styles.imageShell}>
        {product.imageUrl && !imageFailed ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} onError={() => setImageFailed(true)} accessibilityLabel={`Imagen de ${product.name}`} />
        ) : (
          <Ionicons name="image-outline" size={52} color={colors.muted} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.business}>{business.name}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.description}>{product.description || "Sin descripción disponible."}</Text>
        <Text style={styles.price}>{formatMoney(product.price)}</Text>
        <View style={styles.quantityRow}>
          <View>
            <Text style={styles.quantityLabel}>Cantidad</Text>
            <Text style={styles.quantityHelp}>Máximo 99 unidades</Text>
          </View>
          <QuantityControl value={quantity} onChange={setQuantity} />
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{formatMoney(product.price * quantity)}</Text>
        </View>
        <AppButton title={`Agregar ${quantity} al carrito`} onPress={addToCart} accessibilityHint="Abre el carrito después de agregar el producto" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
  imageShell: { height: 300, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  image: { width: "100%", height: "100%" },
  content: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  business: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  description: { color: colors.muted, fontSize: typography.body, lineHeight: 23 },
  price: { color: colors.primaryDark, fontSize: typography.title, fontWeight: "900" },
  quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  quantityLabel: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  quantityHelp: { color: colors.muted, fontSize: typography.tiny },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { color: colors.muted, fontSize: typography.body },
  total: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
});
