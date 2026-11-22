import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { getRoleLabel } from "../../constants/roles";
import { useAppStyles, radii, spacing, typography } from "../../theme";

export function ProfileScreen() {
  const { colors, styles } = useAppStyles(makeStyles);
  const { user, logout, loading } = useAuth();

  function requestLogout() {
    Alert.alert("Cerrar sesión", "¿Deseas volver a la pantalla de acceso?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ]);
  }

  return (
    <ScreenContainer scroll contentStyle={styles.page} safeEdges={["left", "right"]}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text></View>
        <View style={styles.profileCopy}>
          <Text style={styles.eyebrow}>MI CUENTA</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
          <View style={styles.rolePill}><Text style={styles.role}>{getRoleLabel(user?.role)}</Text></View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mis datos</Text>
        <InfoRow icon="mail-outline" label="Correo" value={user?.email} />
        <InfoRow icon="call-outline" label="Teléfono" value={user?.phone || "No registrado"} />
        <InfoRow icon="location-outline" label="Dirección" value={user?.address || "No registrada"} />
        <InfoRow icon="chatbox-outline" label="Indicaciones" value={user?.deliveryInstructions || "Sin indicaciones"} />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Text style={styles.subtitle}>Administra tu sesión de EmprendeLink.</Text>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={requestLogout}
          style={({ pressed }) => [styles.logoutButton, (pressed || loading) && styles.faded]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>{loading ? "Cerrando sesión..." : "Cerrar sesión"}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function InfoRow({ icon, label, value }) {
  const { colors, styles } = useAppStyles(makeStyles);
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  page: { gap: spacing.lg, paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  avatar: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primary },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: "800" },
  profileCopy: { flex: 1, alignItems: "flex-start", gap: spacing.xs },
  name: { color: colors.ink, fontSize: typography.title, fontWeight: "800" },
  rolePill: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  role: { color: colors.primaryDark, fontSize: typography.tiny, fontWeight: "900", textTransform: "uppercase" },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.primarySoft },
  infoCopy: { flex: 1, gap: 2 },
  infoLabel: { color: colors.muted, fontSize: typography.tiny, fontWeight: "700", textTransform: "uppercase" },
  infoValue: { color: colors.ink, fontSize: typography.body, lineHeight: 21 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, minHeight: 44, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.danger, borderRadius: 10 },
  logoutText: { color: colors.danger, fontWeight: "800", fontSize: typography.body },
  faded: { opacity: 0.6 },
});
