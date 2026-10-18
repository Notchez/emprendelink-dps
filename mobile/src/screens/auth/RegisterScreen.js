import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { AuthHeader } from "../../components/AuthHeader";
import { PasswordInput } from "../../components/PasswordInput";
import { ScreenContainer } from "../../components/ScreenContainer";
import { REGISTRATION_ROLES, ROLES } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import { hasValidationErrors, validateRegistration } from "../../utils/validation";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  deliveryInstructions: "",
  role: ROLES.CUSTOMER,
  password: "",
  confirmPassword: "",
};

export function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  async function submit() {
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) return;
    try {
      await register(values);
    } catch (failure) {
      setFormError(failure instanceof Error ? failure.message : "No se pudo crear la cuenta.");
    }
  }

  return (
    <ScreenContainer scroll keyboard contentStyle={styles.page}>
      <AuthHeader
        eyebrow="ÚNETE A EMPRENDELINK"
        title="Crear cuenta"
        subtitle="Regístrate para comprar o comenzar a vender en nuestra comunidad."
      />

      <View style={styles.card}>
        {formError ? <Text accessibilityRole="alert" style={styles.errorBanner}>{formError}</Text> : null}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tipo de cuenta</Text>
          <View style={styles.roles} accessibilityRole="radiogroup">
            {REGISTRATION_ROLES.map((option) => {
              const selected = values.role === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => change("role", option.value)}
                  style={[styles.role, selected && styles.roleSelected]}
                >
                  <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{option.label}</Text>
                  <Text style={styles.roleDescription}>{option.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <AppInput label="Nombre completo" value={values.name} onChangeText={(value) => change("name", value)} error={errors.name} autoComplete="name" placeholder="Tu nombre" />
        <AppInput label="Correo electrónico" value={values.email} onChangeText={(value) => change("email", value)} error={errors.email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="correo@ejemplo.com" />

        {values.role === ROLES.CUSTOMER ? (
          <>
            <AppInput label="Teléfono" value={values.phone} onChangeText={(value) => change("phone", value)} error={errors.phone} autoComplete="tel" keyboardType="phone-pad" placeholder="7777-7777" />
            <AppInput label="Dirección de entrega" value={values.address} onChangeText={(value) => change("address", value)} error={errors.address} autoComplete="street-address" multiline placeholder="Colonia, calle y referencia" />
            <AppInput label="Indicaciones (opcional)" value={values.deliveryInstructions} onChangeText={(value) => change("deliveryInstructions", value)} multiline placeholder="Ej. llamar al llegar" />
          </>
        ) : null}

        <PasswordInput label="Contraseña" value={values.password} onChangeText={(value) => change("password", value)} error={errors.password} autoComplete="new-password" placeholder="8+ caracteres, letra y número" />
        <PasswordInput label="Confirmar contraseña" value={values.confirmPassword} onChangeText={(value) => change("confirmPassword", value)} error={errors.confirmPassword} autoComplete="new-password" returnKeyType="done" onSubmitEditing={() => void submit()} placeholder="Repite tu contraseña" />
        <AppButton title="Crear mi cuenta" onPress={() => void submit()} loading={loading} />
        <Text style={styles.disclaimer}>Esta entrega utiliza autenticación temporal en memoria. Firebase Authentication se conectará en Foro 2 sin cambiar estas pantallas.</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
        <Pressable accessibilityRole="link" onPress={() => navigation.navigate("Login")} hitSlop={8}>
          <Text style={styles.link}>Iniciar sesión</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  errorBanner: { padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.dangerSoft, color: colors.danger, fontSize: typography.caption },
  fieldGroup: { gap: spacing.sm },
  label: { color: colors.ink, fontSize: typography.caption, fontWeight: "700" },
  roles: { flexDirection: "row", gap: spacing.sm },
  role: { flex: 1, gap: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.background },
  roleSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  roleTitle: { color: colors.ink, fontSize: typography.caption, fontWeight: "800" },
  roleTitleSelected: { color: colors.primaryDark },
  roleDescription: { color: colors.muted, fontSize: typography.tiny },
  disclaimer: { color: colors.muted, fontSize: typography.tiny, lineHeight: 17, textAlign: "center" },
  footer: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingBottom: spacing.xl },
  footerText: { color: colors.muted, fontSize: typography.caption },
  link: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
});
