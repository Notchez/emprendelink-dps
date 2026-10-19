import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { OrderCard } from "../../components/OrderCard";
import { useOrders } from "../../context/OrdersContext";
import { colors, spacing, typography } from "../../theme";

export function OrdersScreen({ navigation }) {
  const { orders, loading, error, refresh } = useOrders();

  if (loading && orders.length === 0) return <SafeAreaView style={styles.center}><LoadingState message="Cargando pedidos..." /></SafeAreaView>;
  if (error && orders.length === 0) return <SafeAreaView style={styles.center}><ErrorState message={error} onRetry={refresh} /></SafeAreaView>;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, marginBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: typography.hero, fontWeight: "900", letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  separator: { height: spacing.md },
});
