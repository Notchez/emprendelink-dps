import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { LoadingState, ErrorState } from "../../components/StateView";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";
import { managementService } from "../../services/managementService";
import { useAppStyles, radii, spacing, typography } from "../../theme";
import { Action, Field, Heading, Notice, Panel } from "./ManagementWidgets";
import { AdminSections } from "./AdminSections";
import { EntrepreneurSections } from "./EntrepreneurSections";

export const adminSections = Object.freeze([
  { id: "dashboard", text: "Panel administrativo", icon: "speedometer-outline" },
  { id: "buyers", text: "Compradores", icon: "people-outline" },
  { id: "businesses", text: "Emprendimientos", icon: "storefront-outline" },
  { id: "plans", text: "Planes", icon: "card-outline" },
  { id: "orders", text: "Pedidos", icon: "receipt-outline" },
  { id: "sales", text: "Ventas", icon: "trending-up-outline" },
  { id: "commissions", text: "Comisiones", icon: "cash-outline" },
  { id: "account", text: "Mi cuenta", icon: "person-circle-outline" },
]);

export const entrepreneurSections = Object.freeze([
  { id: "dashboard", text: "Panel principal", icon: "speedometer-outline" },
  { id: "business", text: "Configuración de tu negocio", icon: "storefront-outline" },
  { id: "categories", text: "Categorías", icon: "grid-outline" },
  { id: "products", text: "Productos", icon: "cube-outline" },
  { id: "orders", text: "Pedidos", icon: "receipt-outline" },
  { id: "sales", text: "Ventas", icon: "trending-up-outline" },
  { id: "commissions", text: "Comisiones", icon: "cash-outline" },
  { id: "account", text: "Mi cuenta", icon: "person-circle-outline" },
]);

function unwrap(result) {
  if (!result.success) throw new Error(result.error?.message || "No se pudo consultar la información.");
  return result.data;
}

async function fetchManagementData({ isAdmin, section, userId }) {
  if (section === "account") return {};
  if (isAdmin) {
    const collections = section === "dashboard" ? ["users", "businesses", "plans", "products"]
      : section === "buyers" ? ["users"]
      : section === "businesses" ? ["businesses", "plans", "users", "products"]
      : section === "plans" ? ["plans"]
      : ["businesses"];
    const data = {};
    const results = await Promise.all(collections.map((name) => managementService.list(name)));
    collections.forEach((name, index) => { data[name] = unwrap(results[index]); });
    if (["dashboard", "orders", "sales", "commissions"].includes(section)) {
      const [orders, commissions] = await Promise.all([
        section !== "commissions" ? managementService.getOrders("") : Promise.resolve({ success: true, data: [] }),
        section !== "orders" ? managementService.getCommissions("") : Promise.resolve({ success: true, data: [] }),
      ]);
      data.orders = unwrap(orders);
      data.commissions = unwrap(commissions);
    }
    return data;
  }

  const business = unwrap(await managementService.getOwnerBusiness(userId));
  const data = { business, categories: [], products: [], plans: [], orders: [], commissions: [] };
  if (["business", "dashboard", "products"].includes(section)) data.plans = unwrap(await managementService.list("plans"));
  if (!business) return data;
  if (["dashboard", "categories", "products"].includes(section)) data.categories = unwrap(await managementService.list("categories", business.id));
  if (["dashboard", "products"].includes(section)) data.products = unwrap(await managementService.list("products", business.id));
  if (["dashboard", "orders", "sales", "commissions"].includes(section)) {
    data.orders = unwrap(await managementService.getOrders(business.id));
    if (["sales", "commissions"].includes(section)) data.commissions = unwrap(await managementService.getCommissions(business.id));
  }
  return data;
}

function AccountSection({ busy }) {
  const { user, updateProfile, logout, loading } = useAuth();
  const { styles } = useAppStyles(makeStyles);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [deliveryInstructions, setDeliveryInstructions] = useState(user?.deliveryInstructions || "");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setFeedback(""); setError("");
    try {
      await updateProfile({ name, phone, address, deliveryInstructions });
      setFeedback("Tus datos fueron guardados correctamente.");
    } catch (failure) { setError(failure.message || "No se pudo guardar el perfil."); }
  }

  function confirmLogout() {
    Alert.alert("Cerrar sesión", "¿Salir de tu cuenta de EmprendeLink?", [
      { text: "Cancelar", style: "cancel" }, { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ]);
  }

  return <>
    <Heading eyebrow="MI CUENTA" title="Mi perfil" subtitle="Administra tus datos de contacto." />
    <Notice message={error} danger /><Notice message={feedback} />
    <Panel title="Información personal">
      <Field label="Nombre completo" value={name} onChangeText={setName} />
      <Field label="Correo electrónico (no editable)" value={user?.email || ""} editable={false} keyboardType="email-address" />
      <Text style={styles.muted}>El correo está asociado a tu identidad de Firebase y no se puede cambiar desde la app.</Text>
      <Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={25} />
      <Field label="Dirección" value={address} onChangeText={setAddress} multiline />
      <Field label="Indicaciones de entrega" value={deliveryInstructions} onChangeText={setDeliveryInstructions} multiline />
      <Action label="Guardar cambios" onPress={() => void save()} disabled={loading || busy} />
    </Panel>
    <Panel title="Sesión">
      <Action label="Cerrar sesión" icon="log-out-outline" destructive secondary disabled={loading} onPress={confirmLogout} />
    </Panel>
  </>;
}

export function ManagementScreen({ isAdmin = false }) {
  const { user, logout } = useAuth();
  const { colors, styles } = useAppStyles(makeStyles);
  const [section, setSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const sections = isAdmin ? adminSections : entrepreneurSections;
  const current = sections.find((item) => item.id === section) || sections[0];
  const userId = user?.id;

  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setData(null);
    fetchManagementData({ isAdmin, section, userId }).then((result) => {
      if (active) setData(result);
    }).catch((failure) => {
      if (active) setError(failure.message || "No se pudo cargar el panel.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAdmin, section, userId, revision]);

  const navigate = useCallback((nextSection) => {
    setSection(nextSection);
    setMenuOpen(false);
  }, []);

  const act = useCallback(async (operation, confirmation, onSuccess) => {
    setBusy(true); setError(""); setFeedback("");
    try {
      unwrap(await operation());
      if (onSuccess) onSuccess();
      setFeedback(confirmation || "Cambios guardados.");
      setRevision((currentRevision) => currentRevision + 1);
    } catch (failure) { setError(failure.message || "No se pudieron guardar los cambios."); }
    finally { setBusy(false); }
  }, []);

  return <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={menuOpen ? "Cerrar menú" : "Abrir menú"} onPress={() => setMenuOpen((open) => !open)} style={styles.menuToggle}>
        <Ionicons name={menuOpen ? "close" : "menu"} size={27} color={colors.ink} />
      </Pressable>
      <View style={styles.brandText}><Text style={styles.brand}>{isAdmin ? "Administración" : "Panel emprendedor"}</Text><Text style={styles.brandCaption}>EmprendeLink</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Mi cuenta" onPress={() => navigate("account")} style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "E"}</Text></Pressable>
    </View>
    {menuOpen ? <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
      <View style={styles.menuBrand}><Ionicons name="storefront" color={colors.primary} size={25} /><Text style={styles.menuBrandText}>EmprendeLink</Text></View>
      <Text style={styles.eyebrow}>{isAdmin ? "ADMINISTRACIÓN" : "MI EMPRENDIMIENTO"}</Text>
      {sections.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: section === item.id }} onPress={() => navigate(item.id)} style={[styles.menuItem, section === item.id && styles.menuActive]}>
        <Ionicons name={item.icon} size={20} color={section === item.id ? colors.primary : colors.muted} />
        <Text style={[styles.menuItemText, section === item.id && styles.menuItemActiveText]}>{item.text}</Text>
      </Pressable>)}
      <Action label="Cerrar sesión" destructive secondary onPress={() => Alert.alert("Cerrar sesión", "¿Salir de EmprendeLink?", [
        { text: "Cancelar", style: "cancel" }, { text: "Cerrar sesión", onPress: () => void logout(), style: "destructive" },
      ])} />
    </ScrollView> : <ScrollView key={section} style={styles.main} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading && data !== null} onRefresh={() => setRevision((currentRevision) => currentRevision + 1)} tintColor={colors.primary} />}>
      {section !== "account" ? <View style={styles.location}><Ionicons name={current.icon} size={17} color={colors.primary} /><Text style={styles.locationText}>{current.text}</Text><Pressable accessibilityRole="button" accessibilityLabel="Actualizar datos" onPress={() => setRevision((value) => value + 1)}><Ionicons name="refresh" size={20} color={colors.primary} /></Pressable></View> : null}
      <Notice message={error} danger /><Notice message={feedback} />
      {section === "account" ? <AccountSection busy={busy} /> : loading ? <LoadingState message="Consultando datos..." /> : data ? isAdmin ? <AdminSections key={section} section={section} data={data} setSection={navigate} act={act} busy={busy} /> : <EntrepreneurSections key={section} section={section} data={data} ownerId={userId} setSection={navigate} act={act} busy={busy} /> : <ErrorState message={error || "No se pudo cargar la información."} onRetry={() => setRevision((value) => value + 1)} />}
    </ScrollView>}
    <View style={styles.footer}><Text style={styles.footerText}>Muchas gracias por utilizar nuestros servicios.</Text></View>
  </SafeAreaView>;
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, gap: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuToggle: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radii.md },
  brandText: { flex: 1, gap: 3 },
  brand: { color: colors.ink, fontWeight: "800", fontSize: typography.subtitle },
  brandCaption: { color: colors.muted, fontWeight: "600", fontSize: typography.tiny },
  avatar: { width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 19 },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: typography.subtitle },
  main: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  location: { flexDirection: "row", gap: spacing.sm, alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  locationText: { flex: 1, color: colors.primaryDark, fontWeight: "800", fontSize: typography.caption },
  menu: { flex: 1, backgroundColor: colors.surface },
  menuContent: { gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.xxl },
  menuBrand: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  menuBrandText: { color: colors.ink, fontSize: typography.title, fontWeight: "900" },
  eyebrow: { color: colors.muted, fontWeight: "800", letterSpacing: 1.2, fontSize: typography.tiny, marginBottom: spacing.sm },
  menuItem: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, minHeight: 50, borderRadius: radii.md },
  menuActive: { backgroundColor: colors.primarySoft },
  menuItemText: { fontWeight: "700", color: colors.ink, fontSize: typography.body, flexShrink: 1 },
  menuItemActiveText: { color: colors.primaryDark },
  footer: { minHeight: 40, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  footerText: { color: colors.muted, fontSize: typography.tiny, textAlign: "center" },
  muted: { color: colors.muted, fontSize: typography.caption, lineHeight: 20 },
});
