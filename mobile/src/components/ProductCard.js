import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { formatMoney } from "../utils/formatters";
import { colors, radii, shadows, spacing, typography } from "../theme";

export function ProductCard({ product, onOpen, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${product.name}`} onPress={onOpen} style={({ pressed }) => [styles.productButton, pressed && styles.pressed]}>
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.title}>{product.name}</Text>
          <Text numberOfLines={2} style={styles.description}>{product.description || "Sin descripción disponible."}</Text>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
        </View>
        <View style={styles.imageShell}>
          {product.imageUrl && !imageFailed ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} onError={() => setImageFailed(true)} accessibilityLabel={`Imagen de ${product.name}`} />
          ) : (
            <Ionicons name="image-outline" size={27} color={colors.muted} />
          )}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Agregar ${product.name} al carrito`}
        hitSlop={8}
        onPress={onAdd}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: "relative", borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  productButton: { minHeight: 132, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  pressed: { opacity: 0.78 },
  content: { flex: 1, gap: spacing.sm, paddingRight: spacing.xs },
  title: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  description: { color: colors.muted, fontSize: typography.caption, lineHeight: 19 },
  price: { marginTop: "auto", color: colors.primaryDark, fontSize: typography.body, fontWeight: "800" },
  imageShell: { width: 104, height: 104, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radii.md, backgroundColor: colors.background },
  image: { width: "100%", height: "100%" },
  addButton: { position: "absolute", right: spacing.sm, bottom: spacing.sm, width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface },
});
