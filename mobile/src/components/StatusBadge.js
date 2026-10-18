import { StyleSheet, Text, View } from "react-native";

import { ORDER_STATUS } from "../constants/orderStatus";
import { formatOrderStatus } from "../utils/formatters";
import { colors, radii, spacing, typography } from "../theme";

export function StatusBadge({ status }) {
  const tone = status === ORDER_STATUS.DELIVERED ? "success" : status === ORDER_STATUS.CANCELLED ? "danger" : status === ORDER_STATUS.PENDING ? "warning" : "primary";
  return (
    <View style={[styles.badge, styles[`${tone}Background`]]}>
      <Text style={[styles.label, styles[tone]]}>{formatOrderStatus(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill },
  label: { fontSize: typography.tiny, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.35 },
  primaryBackground: { backgroundColor: colors.primarySoft },
  successBackground: { backgroundColor: colors.successSoft },
  warningBackground: { backgroundColor: colors.warningSoft },
  dangerBackground: { backgroundColor: colors.dangerSoft },
  primary: { color: colors.primaryDark },
  success: { color: colors.success },
  warning: { color: colors.warning },
  danger: { color: colors.danger },
});
