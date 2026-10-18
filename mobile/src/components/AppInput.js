import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

export function AppInput({ label, error, rightAccessory, inputRef, ...inputProps }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputError]}>
        <TextInput
          ref={inputRef}
          placeholderTextColor="#98A2B3"
          style={styles.input}
          accessibilityLabel={label}
          {...inputProps}
        />
        {rightAccessory}
      </View>
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { color: colors.ink, fontSize: typography.caption, fontWeight: "700" },
  inputShell: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, minHeight: 48, paddingHorizontal: spacing.md, color: colors.ink, fontSize: typography.body },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: typography.caption },
});
