import { SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { OrderCard } from "../../components/OrderCard";
import { ORDER_STATUS } from "../../constants/orderStatus";
import { useOrders } from "../../context/OrdersContext";
import { colors, radii, spacing, typography } from "../../theme";

export function OrdersScreen({ navigation }) {
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
            <Text style={styles.eyebrow}>SEGUIMIENTO</Text>
            <Text style={styles.title}>Mis pedidos</Text>
            <Text style={styles.subtitle}>Consulta el estado y los detalles de tus compras.</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Aún no tienes pedidos" message="Cuando confirmes una compra aparecerá aquí." icon="receipt-outline" actionLabel="Explorar negocios" onAction={() => navigation.navigate("Businesses")} />}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => navigation.navigate("OrderDetail", { order: item })} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, marginBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  sectionHeading: { gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "800" },
  emptySection: { padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, color: colors.muted },
  separator: { height: spacing.md },
});
