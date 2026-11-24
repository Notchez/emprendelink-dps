import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { OrderCard } from "../../components/OrderCard";
import { ORDER_STATUS } from "../../constants/orderStatus";
import { useOrders } from "../../context/OrdersContext";
import { useAppStyles, radii, spacing, typography } from "../../theme";

export function OrdersScreen({ navigation }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const { orders, loading, error, refresh } = useOrders();
  const sections = orders.length > 0 ? [
    {
      title: "En curso",
      emptyText: "No tienes pedidos en curso.",
      data: orders.filter((order) => order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED),
    },
    {
      title: "Historial",
      emptyText: "Todavía no tienes pedidos finalizados.",
      data: orders.filter((order) => order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED),
    },
  ] : [];

  if (loading && orders.length === 0) return <SafeAreaView edges={["left", "right"]} style={styles.center}><LoadingState message="Cargando pedidos..." /></SafeAreaView>;
  if (error && orders.length === 0) return <SafeAreaView edges={["left", "right"]} style={styles.center}><ErrorState message={error} onRetry={refresh} /></SafeAreaView>;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safe}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.length === 0 && <Text style={styles.emptySection}>{section.emptyText}</Text>}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headingCopy}>
                <Text style={styles.eyebrow}>TU ACTIVIDAD</Text>
                <Text style={styles.title}>Pedidos</Text>
                <Text style={styles.subtitle}>Revisa el estado de tus compras y consulta tu historial.</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Actualizar pedidos" disabled={loading} onPress={refresh} style={styles.refresh}>
                <Ionicons name="refresh" size={21} color={colors.ink} />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Aún no tienes pedidos" message="Cuando confirmes una compra aparecerá aquí." icon="receipt-outline" actionLabel="Explorar negocios" onAction={() => navigation.navigate("Businesses")} />}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => navigation.navigate("OrderDetail", { order: item })} />}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, marginBottom: spacing.xl },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  headingCopy: { flex: 1, gap: spacing.xs },
  refresh: { width: 42, height: 42, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  sectionHeading: { gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  emptySection: { padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, color: colors.muted },
  separator: { height: spacing.md },
});
