import { useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "../../components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../hooks/useCatalog";
import { useAppStyles, radii, spacing, typography } from "../../theme";

export function CatalogScreen({ navigation, route }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const { businessId } = route.params;
  const { catalog, loading, error, reload } = useCatalog(businessId);
  const { addItem, replaceWithItem, totalItems } = useCart();
  const [logoFailed, setLogoFailed] = useState(false);
  const products = catalog?.products ?? [];

  function addProduct(product) {
    if (addItem(product, catalog.business, 1)) return;
    Alert.alert(
      "Productos de otro negocio",
      "El carrito solo puede contener productos de un negocio. ¿Deseas reemplazar su contenido?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Reemplazar", style: "destructive", onPress: () => replaceWithItem(product, catalog.business, 1) },
      ]
    );
  }

  if (loading) return <SafeAreaView style={styles.center}><LoadingState message="Cargando catálogo..." /></SafeAreaView>;
  if (error || !catalog) return <SafeAreaView style={styles.center}><ErrorState message={error || "Catálogo no disponible."} onRetry={reload} /></SafeAreaView>;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safe}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.businessRow}>
              <View style={styles.businessIcon}>
                {catalog.business.logoUrl && !logoFailed ? (
                  <Image source={{ uri: catalog.business.logoUrl }} style={styles.logo} resizeMode="contain" onError={() => setLogoFailed(true)} accessibilityLabel={`Logo de ${catalog.business.name}`} />
                ) : (
                  <Ionicons name="storefront-outline" size={27} color={colors.muted} />
                )}
              </View>
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>EMPRENDIMIENTO</Text>
                <Text style={styles.title}>{catalog.business.name}</Text>
                <Text style={styles.subtitle}>Explora los productos disponibles.</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Abrir carrito con ${totalItems} productos`} onPress={() => navigation.navigate("Cart")} style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}>
              <Ionicons name="cart-outline" size={21} color={colors.ink} />
              <Text style={styles.cartLabel}>Carrito</Text>
              {totalItems > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View> : null}
            </Pressable>
            <View style={styles.resultsRow}>
              <Text style={styles.sectionTitle}>Productos</Text>
              <Text style={styles.count}>{products.length} {products.length === 1 ? "producto" : "productos"}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Sin productos" message="Este emprendimiento aún no tiene productos disponibles." icon="cube-outline" />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onOpen={() => navigation.navigate("ProductDetail", { product: item, business: catalog.business })}
            onAdd={() => addProduct(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  businessRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  businessIcon: { width: 72, height: 72, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radii.md, backgroundColor: colors.subtle },
  logo: { width: "100%", height: "100%", backgroundColor: colors.surface },
  heading: { flex: 1, gap: 2 },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: typography.caption },
  cartButton: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.subtle },
  cartLabel: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  cartBadge: { minWidth: 21, height: 21, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, borderRadius: radii.pill, backgroundColor: colors.primary },
  cartBadgeText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  pressed: { opacity: 0.8 },
  resultsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "900" },
  count: { color: colors.muted, fontSize: typography.caption },
  separator: { height: spacing.md },
});
