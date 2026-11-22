import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useAppStyles, radii, spacing, typography } from "../theme";

export function CustomerTopBar({ title, onCart, onProfile }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const { user } = useAuth();
  const { totalItems } = useCart();
  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Carrito con ${totalItems} productos`}
            onPress={onCart}
            style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
          >
            <Ionicons name="cart-outline" size={21} color={colors.ink} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems > 99 ? "99+" : totalItems}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir a mi perfil"
            onPress={onProfile}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  header: { minHeight: 60, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  title: { flex: 1, color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cartButton: { width: 42, height: 42, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -5, right: -5, minWidth: 19, height: 19, paddingHorizontal: 4, borderWidth: 2, borderColor: colors.surface, borderRadius: radii.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: "800" },
  avatar: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontSize: typography.body, fontWeight: "800" },
  pressed: { opacity: 0.75 },
});
