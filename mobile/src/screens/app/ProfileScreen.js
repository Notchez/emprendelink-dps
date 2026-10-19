import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { getRoleLabel } from "../../constants/roles";
import { colors, radii, shadows, spacing, typography } from "../../theme";

export function ProfileScreen() {
  const { user, logout, loading } = useAuth();

  function requestLogout() {
    Alert.alert("Cerrar sesión", "¿Deseas volver a la pantalla de acceso?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ]);
  }

  return (
    <ScreenContainer scroll contentStyle={styles.page}>
      <View style={styles.heading}><Text style={styles.eyebrow}>TU CUENTA</Text><Text style={styles.title}>Mi perfil</Text><Text style={styles.subtitle}>Información utilizada en la experiencia móvil.</Text></View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.rolePill}><Text style={styles.role}>{getRoleLabel(user?.role)}</Text></View>
      </View>
      <View style={styles.card}>
        <InfoRow icon="mail-outline" label="Correo" value={user?.email} />
        <InfoRow icon="call-outline" label="Teléfono" value={user?.phone || "No registrado"} />
        <InfoRow icon="location-outline" label="Dirección" value={user?.address || "No registrada"} />
        <InfoRow icon="chatbox-outline" label="Indicaciones" value={user?.deliveryInstructions || "Sin indicaciones"} />
      </View>
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.noteText}>En Foro 1 los datos viven en memoria. El servicio está preparado para sustituirse por Firebase en Foro 2.</Text>
      </View>
      <AppButton title="Cerrar sesión" onPress={requestLogout} loading={loading} variant="ghost" />
    </ScreenContainer>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
  heading: { gap: spacing.xs },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: typography.hero, fontWeight: "900", letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  profileCard: { alignItems: "center", gap: spacing.sm, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  avatar: { width: 78, height: 78, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primary },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: "900" },
  name: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  rolePill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  role: { color: colors.primaryDark, fontSize: typography.tiny, fontWeight: "900", textTransform: "uppercase" },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.primarySoft },
  infoCopy: { flex: 1, gap: 2 },
  infoLabel: { color: colors.muted, fontSize: typography.tiny, fontWeight: "700", textTransform: "uppercase" },
  infoValue: { color: colors.ink, fontSize: typography.body, lineHeight: 21 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primarySoft },
  noteText: { flex: 1, color: colors.primaryDark, fontSize: typography.caption, lineHeight: 19 },
});
