import { useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "../../components/ProductCard";
import { SearchInput } from "../../components/SearchInput";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../hooks/useCatalog";
import { colors, radii, spacing, typography } from "../../theme";

export function CatalogScreen({ navigation, route }) {
  const { businessId } = route.params;
  const { catalog, loading, error, reload } = useCatalog(businessId);
  const { addItem, replaceWithItem, totalItems } = useCart();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("cat_all");

  const products = (() => {
    const query = search.trim().toLowerCase();
    return (catalog?.products ?? []).filter((product) => {
      const categoryMatches = categoryId === "cat_all" || product.categoryId === categoryId;
      const textMatches = !query || `${product.name} ${product.description}`.toLowerCase().includes(query);
      return categoryMatches && textMatches;
    });
  })();

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
              <View style={styles.businessIcon}><Ionicons name="storefront-outline" size={27} color={colors.primary} /></View>
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>EMPRENDIMIENTO</Text>
                <Text style={styles.title}>{catalog.business.name}</Text>
                <Text style={styles.subtitle}>Explora los productos disponibles.</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Abrir carrito con ${totalItems} productos`} onPress={() => navigation.navigate("Cart")} style={styles.cartButton}>
                <Ionicons name="cart-outline" size={25} color={colors.primary} />
                {totalItems > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View> : null}
              </Pressable>
            </View>
            <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar productos" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {catalog.categories.map((category) => {
                const selected = category.id === categoryId;
                return (
                  <Pressable key={category.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setCategoryId(category.id)} style={[styles.category, selected && styles.categorySelected]}>
                    <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.resultsRow}>
              <Text style={styles.sectionTitle}>Productos</Text>
              <Text style={styles.count}>{products.length} {products.length === 1 ? "producto" : "productos"}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Sin productos" message="No encontramos productos con estos filtros." icon="search-outline" />}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  businessRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  businessIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.primarySoft },
  heading: { flex: 1, gap: 2 },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: typography.caption },
  cartButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, backgroundColor: colors.surface },
  cartBadge: { position: "absolute", top: -3, right: -3, minWidth: 21, height: 21, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, borderRadius: radii.pill, backgroundColor: colors.danger },
  cartBadgeText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  categories: { gap: spacing.sm, paddingRight: spacing.lg },
  category: { minHeight: 40, justifyContent: "center", paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, backgroundColor: colors.surface },
  categorySelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  categoryText: { color: colors.muted, fontSize: typography.caption, fontWeight: "700" },
  categoryTextSelected: { color: colors.white },
  resultsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: colors.ink, fontSize: typography.subtitle, fontWeight: "900" },
  count: { color: colors.muted, fontSize: typography.caption },
  separator: { height: spacing.md },
});
