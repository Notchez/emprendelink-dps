import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppStyles, radii, spacing, typography } from "../theme";

export function BusinessCard({ business, onPress }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir catálogo de ${business.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageShell}>
        {business.logoUrl && !imageFailed ? (
          <Image source={{ uri: business.logoUrl }} style={styles.image} resizeMode="contain" onError={() => setImageFailed(true)} accessibilityLabel={`Imagen de ${business.name}`} />
        ) : (
          <Ionicons name="storefront-outline" size={31} color={colors.primary} />
        )}
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>{business.name}</Text>
        <Text style={styles.subtitle}>Emprendimiento local</Text>
        <Text style={styles.link}>Catálogo disponible</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.muted} />
    </Pressable>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  imageShell: { width: 74, height: 74, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radii.md, backgroundColor: colors.subtle },
  image: { width: "100%", height: "100%", backgroundColor: colors.surface },
  content: { flex: 1, gap: spacing.xs },
  title: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: typography.caption },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "700" },
});
