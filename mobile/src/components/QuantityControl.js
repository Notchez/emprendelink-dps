import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../theme";

export function QuantityControl({ value, onChange, minimum = 1 }) {
  return (
    <View style={styles.wrapper} accessibilityLabel={`Cantidad: ${value}`}>
      <Pressable accessibilityRole="button" accessibilityLabel="Restar una unidad" hitSlop={6} onPress={() => onChange(Math.max(minimum, value - 1))} style={styles.button}>
        <Ionicons name="remove" size={19} color={colors.ink} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Agregar una unidad" hitSlop={6} onPress={() => onChange(Math.min(99, value + 1))} style={styles.button}>
        <Ionicons name="add" size={19} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: 3, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, backgroundColor: colors.background },
  button: { width: 35, height: 35, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.surface },
  value: { minWidth: 24, color: colors.ink, fontWeight: "800", textAlign: "center" },
});
