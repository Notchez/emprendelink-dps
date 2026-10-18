import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { AuthHeader } from "../../components/AuthHeader";
import { PasswordInput } from "../../components/PasswordInput";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { demoCredentials } from "../../data/mockData";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import { hasValidationErrors, validateLogin } from "../../utils/validation";

export function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  async function submit() {
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) return;
    try {
      await login(values);
    } catch (failure) {
      setFormError(failure instanceof Error ? failure.message : "No se pudo iniciar sesión.");
    }
  }

  function useDemoAccount() {
    setValues({ ...demoCredentials });
    setErrors({});
    setFormError("");
  }

  return (
    <ScreenContainer scroll keyboard contentStyle={styles.page}>
      <AuthHeader
        eyebrow="BIENVENIDO DE NUEVO"
        title="Iniciar sesión"
        subtitle="Descubre emprendimientos, compra local y consulta tus pedidos."
      />

      <View style={styles.card}>
        {formError ? <Text accessibilityRole="alert" style={styles.errorBanner}>{formError}</Text> : null}
        <AppInput
          label="Correo electrónico"
          value={values.email}
          onChangeText={(value) => change("email", value)}
          error={errors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          placeholder="correo@ejemplo.com"
        />
        <PasswordInput
          label="Contraseña"
          value={values.password}
          onChangeText={(value) => change("password", value)}
          error={errors.password}
          autoComplete="current-password"
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          placeholder="Escribe tu contraseña"
        />
        <AppButton title="Iniciar sesión" onPress={() => void submit()} loading={loading} />
        <AppButton title="Usar cuenta de demostración" onPress={useDemoAccount} variant="secondary" disabled={loading} />
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Acceso para la demostración</Text>
          <Text selectable style={styles.demoText}>{demoCredentials.email}</Text>
          <Text selectable style={styles.demoText}>{demoCredentials.password}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Todavía no tienes cuenta?</Text>
        <Pressable accessibilityRole="link" onPress={() => navigation.navigate("Register")} hitSlop={8}>
          <Text style={styles.link}>Crear cuenta</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  errorBanner: { padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.dangerSoft, color: colors.danger, fontSize: typography.caption, lineHeight: 19 },
  demoBox: { gap: spacing.xs, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.background },
  demoTitle: { color: colors.ink, fontSize: typography.caption, fontWeight: "800" },
  demoText: { color: colors.muted, fontSize: typography.caption },
  footer: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingBottom: spacing.xl },
  footerText: { color: colors.muted, fontSize: typography.caption },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
});
