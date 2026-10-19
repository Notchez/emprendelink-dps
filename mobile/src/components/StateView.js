import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "./AppButton";
import { colors, radii, spacing, typography } from "../theme";

export function LoadingState({ message = "Cargando..." }) {
  return (
    <View style={styles.state} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function EmptyState({ title, message, icon = "file-tray-outline", actionLabel, onAction }) {
  return <State icon={icon} title={title} message={message} actionLabel={actionLabel} onAction={onAction} />;
}

export function ErrorState({ message, onRetry }) {
  return <State icon="alert-circle-outline" title="Algo salió mal" message={message} actionLabel="Intentar de nuevo" onAction={onRetry} danger />;
}

function State({ icon, title, message, actionLabel, onAction, danger = false }) {
  return (
    <View style={styles.state} accessibilityRole={danger ? "alert" : undefined}>
      <View style={[styles.icon, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={30} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? <AppButton title={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surface },
  icon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  dangerIcon: { backgroundColor: colors.dangerSoft },
  title: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800", textAlign: "center" },
  message: { color: colors.muted, fontSize: typography.body, lineHeight: 22, textAlign: "center" },
});
