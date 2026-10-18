import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup } from "../../components/BrandLockup";
import { BusinessCard } from "../../components/BusinessCard";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { SearchInput } from "../../components/SearchInput";
import { useBusinesses } from "../../hooks/useBusinesses";
import { colors, spacing, typography } from "../../theme";

export function BusinessesScreen({ navigation }) {
  const { businesses, loading, error, reload } = useBusinesses();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return businesses.filter((business) => !query || business.name.toLowerCase().includes(query));
  }, [businesses, search]);

  if (loading) return <SafeAreaView style={styles.safe}><LoadingState message="Cargando negocios..." /></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safe}><ErrorState message={error} onRetry={reload} /></SafeAreaView>;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <BrandLockup compact />
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>EMPRENDELINK</Text>
              <Text style={styles.title}>Negocios</Text>
              <Text style={styles.subtitle}>Descubre emprendimientos y explora sus productos.</Text>
            </View>
            <SearchInput value={search} onChangeText={setSearch} placeholder="¿Qué estás buscando?" />
            <Text style={styles.count}>{filtered.length} {filtered.length === 1 ? "negocio" : "negocios"}</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Sin resultados" message="Prueba con otro nombre de negocio." icon="search-outline" />}
        renderItem={({ item }) => (
          <BusinessCard business={item} onPress={() => navigation.navigate("Catalog", { businessId: item.id, businessName: item.name })} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: spacing.lg },
  content: { paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  heading: { gap: spacing.xs },
  eyebrow: { color: colors.primary, fontSize: typography.tiny, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: typography.hero, fontWeight: "900", letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  count: { color: colors.ink, fontSize: typography.caption, fontWeight: "800" },
  separator: { height: spacing.md },
});
