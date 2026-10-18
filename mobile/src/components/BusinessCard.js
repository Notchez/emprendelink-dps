import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, shadows, spacing, typography } from "../theme";

export function BusinessCard({ business, onPress }) {
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
          <Image source={{ uri: business.logoUrl }} style={styles.image} onError={() => setImageFailed(true)} accessibilityLabel={`Imagen de ${business.name}`} />
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

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  imageShell: { width: 76, height: 76, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radii.md, backgroundColor: colors.primarySoft },
  image: { width: "100%", height: "100%" },
  content: { flex: 1, gap: spacing.xs },
  title: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: typography.caption },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "700" },
});
