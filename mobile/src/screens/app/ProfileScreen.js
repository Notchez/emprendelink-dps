import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { useAppStyles, radii, spacing, typography } from "../../theme";

export function ProfileScreen() {
  const { colors, styles } = useAppStyles(makeStyles);
  const { user, updateProfile, logout, loading } = useAuth();
  const [values, setValues] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    deliveryInstructions: user?.deliveryInstructions || "",
  }));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  }

  async function save() {
    setError("");
    setMessage("");
    try {
      await updateProfile(values);
      setMessage("Tus datos se guardaron correctamente.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudieron guardar los cambios.");
    }
  }

  function requestLogout() {
    Alert.alert("Cerrar sesión", "¿Deseas volver a la pantalla de acceso?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ]);
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Cliente";

  return (
    <ScreenContainer scroll keyboard contentStyle={styles.page} safeEdges={["left", "right"]}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></View>
        <View style={styles.profileCopy}>
          <Text style={styles.eyebrow}>MI PERFIL</Text>
          <Text style={styles.name}>¡Hola, {firstName}!</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {message ? <Text accessibilityRole="alert" style={styles.success}>{message}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mi información</Text>
        <Text style={styles.subtitle}>Estos datos se utilizan para gestionar tus pedidos.</Text>
        <AppInput label="Nombre completo" value={values.name} maxLength={100} autoComplete="name" onChangeText={(value) => change("name", value)} />
        <AppInput label="Correo electrónico" value={user?.email || ""} editable={false} autoCapitalize="none" keyboardType="email-address" />
        <AppInput label="Teléfono" value={values.phone} maxLength={25} autoComplete="tel" keyboardType="phone-pad" onChangeText={(value) => change("phone", value)} />
        <AppInput label="Dirección" value={values.address} maxLength={500} multiline numberOfLines={3} textAlignVertical="top" onChangeText={(value) => change("address", value)} />
        <AppInput label="Indicaciones de entrega (opcional)" value={values.deliveryInstructions} maxLength={500} multiline numberOfLines={3} textAlignVertical="top" placeholder="Ej.: portón azul, llamar al llegar." onChangeText={(value) => change("deliveryInstructions", value)} />
        <AppButton title="Guardar cambios" onPress={() => void save()} loading={loading} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Text style={styles.subtitle}>Administra tu sesión de EmprendeLink.</Text>
        <Pressable accessibilityRole="button" disabled={loading} onPress={requestLogout} style={({ pressed }) => [styles.logoutButton, (pressed || loading) && styles.faded]}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>{loading ? "Cerrando sesión..." : "Cerrar sesión"}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  page: { gap: spacing.lg, paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  subtitle: { color: colors.muted, fontSize: typography.caption, lineHeight: 20 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.md },
  avatar: { width: 60, height: 60, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primary },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: "800" },
  profileCopy: { flex: 1, gap: spacing.xs },
  name: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radii.md },
  success: { color: colors.success, backgroundColor: colors.successSoft, padding: spacing.md, borderRadius: radii.md },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, minHeight: 44, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  logoutText: { color: colors.danger, fontWeight: "800", fontSize: typography.body },
  faded: { opacity: 0.6 },
});
