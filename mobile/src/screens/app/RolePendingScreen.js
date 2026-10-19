import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { BrandLockup } from "../../components/BrandLockup";
import { ScreenContainer } from "../../components/ScreenContainer";
import { ROLES, getRoleLabel } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import { colors, radii, shadows, spacing, typography } from "../../theme";

export function RolePendingScreen() {
  const { user, logout, loading } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const roleLabel = getRoleLabel(user?.role);

  return (
    <ScreenContainer scroll contentStyle={styles.page}>
      <BrandLockup />
      <View style={styles.card}>
        <View style={styles.iconShell}>
          <Ionicons
            name={isAdmin ? "shield-checkmark-outline" : "briefcase-outline"}
            size={36}
            color={colors.primary}
          />
        </View>
        <Text style={styles.eyebrow}>{roleLabel.toUpperCase()}</Text>
        <Text style={styles.title}>Hola, {user?.name}</Text>
        <Text style={styles.description}>
          {isAdmin
            ? "El panel administrativo móvil no forma parte de Foro 1. La administración continúa disponible en la aplicación web."
            : "El módulo móvil para emprendedores se integrará en una etapa posterior. Actualmente, este avance implementa el flujo principal de cliente."}
        </Text>
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
          <Text style={styles.noticeText}>
            Tu sesión respeta el rol {roleLabel}. No tendrás acceso al catálogo, carrito ni pedidos
            del flujo de cliente.
          </Text>
        </View>
      </View>
      <AppButton
        title="Cerrar sesión"
        onPress={() => void logout()}
        loading={loading}
        variant="ghost"
        accessibilityHint="Regresa a la pantalla de inicio de sesión"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { justifyContent: "center", gap: spacing.xl },
  card: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  iconShell: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.tiny,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    textAlign: "center",
  },
  notice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
  noticeText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: typography.caption,
    lineHeight: 19,
  },
});
