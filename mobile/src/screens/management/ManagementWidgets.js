import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BusinessLogo } from "../../components/BusinessLogo";
import { useAppStyles, spacing, radii, typography } from "../../theme";

export function Panel({ children, title, subtitle }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.panel}>
    {title ? <Text style={styles.panelTitle}>{title}</Text> : null}
    {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
    {children}
  </View>;
}

export function Heading({ eyebrow, title, subtitle }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.heading}>
    <Text style={styles.eyebrow}>{eyebrow}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
  </View>;
}

export function Detail({ label, value, emphasis = false }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.detail}>
    <Text style={styles.muted}>{label}</Text>
    <Text selectable style={emphasis ? styles.valueStrong : styles.value}>{String(value ?? "—")}</Text>
  </View>;
}

export function Kpi({ label, value, icon = "stats-chart" }) {
  const { colors, styles } = useAppStyles(makeStyles);
  return <View style={styles.kpi}>
    <Ionicons name={icon} color={colors.primary} size={22} />
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.muted}>{label}</Text>
  </View>;
}

export function Field({ label, value, onChangeText, multiline = false, keyboardType = "default", placeholder, editable = true, maxLength = 500 }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      value={String(value ?? "")}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      editable={editable}
      keyboardType={keyboardType}
      multiline={multiline}
      maxLength={maxLength}
      style={[styles.input, multiline && styles.multiline, !editable && styles.readonly]}
      autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
    />
  </View>;
}

export function Choice({ label, options, value, onChange, disabled = false }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.choices}>
      {options.map((option) => <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityState={{ selected: value === option.value, disabled }}
        disabled={disabled}
        onPress={() => onChange(option.value)}
        style={[styles.choice, value === option.value && styles.choiceActive]}
      ><Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>{option.label}</Text></Pressable>)}
    </View>
  </View>;
}

export function Action({ label, onPress, icon, destructive = false, secondary = false, disabled = false }) {
  const { colors, styles } = useAppStyles(makeStyles);
  return <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [styles.action, (destructive || secondary) && styles.secondary, disabled && styles.disabled, pressed && styles.pressed]}
  >
    {icon ? <Ionicons name={icon} color={destructive ? colors.danger : secondary ? colors.primary : colors.white} size={18} /> : null}
    <Text style={[styles.actionText, destructive && styles.destructiveText, secondary && !destructive && styles.secondaryText]}>{label}</Text>
  </Pressable>;
}

export function BusinessRow({ business, children }) {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.businessRow}>
    <BusinessLogo logoUrl={business?.logoUrl} name={business?.name} size={55} />
    <View style={styles.businessCopy}>
      <Text style={styles.valueStrong}>{business?.name || "Emprendimiento"}</Text>
      {business?.slug ? <Text style={styles.muted}>/catalogo/{business.slug}</Text> : null}
      {children}
    </View>
  </View>;
}

export function Notice({ message, danger = false }) {
  const { styles } = useAppStyles(makeStyles);
  return message ? <Text accessibilityRole="alert" style={[styles.notice, danger && styles.noticeDanger]}>{message}</Text> : null;
}

export function Separator() {
  const { styles } = useAppStyles(makeStyles);
  return <View style={styles.separator} />;
}

const makeStyles = (colors) => StyleSheet.create({
  panel: { gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  heading: { gap: spacing.sm, marginBottom: spacing.sm },
  eyebrow: { color: colors.primary, fontWeight: "900", letterSpacing: 1.2, fontSize: typography.tiny },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900" },
  panelTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: typography.caption, lineHeight: 20, flexShrink: 1 },
  detail: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md },
  value: { color: colors.ink, fontSize: typography.body, textAlign: "right", flexShrink: 1 },
  valueStrong: { color: colors.ink, fontSize: typography.body, fontWeight: "800", flexShrink: 1 },
  kpi: { width: "47%", flexGrow: 1, gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg },
  kpiValue: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  field: { gap: spacing.sm },
  fieldLabel: { color: colors.ink, fontSize: typography.caption, fontWeight: "800" },
  input: { minHeight: 47, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, color: colors.ink, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.body },
  multiline: { height: 95, textAlignVertical: "top" },
  readonly: { opacity: 0.65 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: { minHeight: 39, justifyContent: "center", borderColor: colors.border, borderWidth: 1, borderRadius: radii.pill, backgroundColor: colors.subtle, paddingHorizontal: spacing.md },
  choiceActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  choiceText: { color: colors.muted, fontWeight: "700", fontSize: typography.caption },
  choiceTextActive: { color: colors.primaryDark },
  action: { minHeight: 44, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: spacing.sm, borderRadius: radii.md, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  secondary: { backgroundColor: colors.primarySoft, borderColor: colors.border, borderWidth: 1 },
  actionText: { color: colors.white, fontWeight: "800", fontSize: typography.body, textAlign: "center" },
  secondaryText: { color: colors.primaryDark },
  destructiveText: { color: colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.72 },
  businessRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  businessCopy: { flex: 1, gap: spacing.xs },
  notice: { padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.successSoft, color: colors.success },
  noticeDanger: { backgroundColor: colors.dangerSoft, color: colors.danger },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
