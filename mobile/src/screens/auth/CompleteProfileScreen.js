import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { AuthHeader } from "../../components/AuthHeader";
import { ScreenContainer } from "../../components/ScreenContainer";
import { REGISTRATION_ROLES, ROLES } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import { colors, radii, spacing, typography } from "../../theme";

export function CompleteProfileScreen() {
  const { identity, completeProfile, logout, loading } = useAuth();
  const [values, setValues] = useState({
    name: identity?.displayName || "",
    role: ROLES.CUSTOMER,
    phone: "",
    address: "",
    deliveryInstructions: "",
  });
  const [formError, setFormError] = useState("");

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFormError("");
  }

  async function submit() {
    if (values.name.trim().length < 2) return setFormError("Escribe tu nombre completo.");
    if (values.role === ROLES.CUSTOMER && values.phone.replace(/\D/g, "").length < 8) return setFormError("Escribe un teléfono válido.");
    if (values.role === ROLES.CUSTOMER && values.address.trim().length < 8) return setFormError("Escribe una dirección más completa.");
    try {
      await completeProfile(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo completar el perfil.");
    }
  }

  return (
    <ScreenContainer scroll keyboard contentStyle={styles.page}>
      <AuthHeader eyebrow="UN ÚLTIMO PASO" title="Completa tu perfil" subtitle={`Conectamos ${identity?.email || "tu cuenta de Google"}. Elige cómo usarás EmprendeLink.`} />
      <View style={styles.card}>
        {formError ? <Text accessibilityRole="alert" style={styles.error}>{formError}</Text> : null}
        <Text style={styles.label}>Tipo de cuenta</Text>
        <View style={styles.roles}>
          {REGISTRATION_ROLES.map((option) => (
            <AppButton key={option.value} title={option.label} onPress={() => change("role", option.value)} variant={values.role === option.value ? "secondary" : "ghost"} disabled={loading} />
          ))}
        </View>
        <AppInput label="Nombre completo" value={values.name} onChangeText={(value) => change("name", value)} />
        {values.role === ROLES.CUSTOMER ? (
          <>
            <AppInput label="Teléfono" value={values.phone} onChangeText={(value) => change("phone", value)} keyboardType="phone-pad" />
            <AppInput label="Dirección de entrega" value={values.address} onChangeText={(value) => change("address", value)} multiline />
            <AppInput label="Indicaciones (opcional)" value={values.deliveryInstructions} onChangeText={(value) => change("deliveryInstructions", value)} multiline />
          </>
        ) : null}
        <AppButton title="Guardar perfil" onPress={() => void submit()} loading={loading} />
        <AppButton title="Usar otra cuenta" onPress={() => void logout()} variant="ghost" disabled={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  card: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  error: { padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.dangerSoft, color: colors.danger, fontSize: typography.caption },
  label: { color: colors.ink, fontSize: typography.caption, fontWeight: "700" },
  roles: { gap: spacing.sm },
});
