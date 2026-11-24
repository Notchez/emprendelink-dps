import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { managementService, normalizeSlug } from "../../services/managementService";
import { formatMoney } from "../../utils/formatters";
import { useAppStyles, spacing, radii } from "../../theme";
import { Action, BusinessRow, Choice, Detail, Field, Heading, Kpi, Panel, Separator } from "./ManagementWidgets";
import { FinancialManagement, OrdersManagement } from "./OrdersManagement";

const emptyProduct = { categoryId: "", name: "", description: "", price: "", imageUrl: "" };

function Overview({ data, setSection }) {
  const { styles } = useAppStyles(makeStyles);
  const { business, categories = [], products = [], orders = [] } = data;
  const activeOrders = orders.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.status));
  if (!business) return <>
    <Heading eyebrow="PRIMER PASO" title="Configura tu negocio" subtitle="Registra el nombre, logotipo y plan para comenzar a vender." />
    <Action label="Configurar mi negocio" onPress={() => setSection("business")} />
  </>;
  return <>
    <Heading eyebrow="PANEL DEL EMPRENDEDOR" title={business.name} subtitle="Gestiona tu catálogo, pedidos y reportes." />
    <Panel><BusinessRow business={business} /><Detail label="Estado" value={business.active ? "Catálogo activo" : "Catálogo desactivado"} /></Panel>
    <View style={styles.grid}>
      <Kpi label="Categorías" value={categories.length} icon="grid-outline" />
      <Kpi label="Productos" value={products.length} icon="cube-outline" />
      <Kpi label="Productos activos" value={products.filter((item) => item.active).length} icon="checkmark-circle-outline" />
      <Kpi label="Pedidos en curso" value={activeOrders.length} icon="receipt-outline" />
    </View>
    {activeOrders.length ? <Panel title="Pedidos recientes">
      {activeOrders.slice(0, 4).map((order) => <Detail key={order.id} label={order.customer?.name || "Cliente"} value={formatMoney(order.subtotal)} />)}
      <Action label="Gestionar pedidos" secondary onPress={() => setSection("orders")} />
    </Panel> : null}
    <Action label="Administrar productos" onPress={() => setSection("products")} />
    <Action label="Ver ventas" secondary onPress={() => setSection("sales")} />
  </>;
}

function BusinessSettings({ data, ownerId, act, busy }) {
  const { styles } = useAppStyles(makeStyles);
  const { business, plans = [] } = data;
  const [form, setForm] = useState({
    name: business?.name || "", slug: business?.slug || "", logoUrl: business?.logoUrl || "", planId: business?.planId || "",
  });
  useEffect(() => { setForm({ name: business?.name || "", slug: business?.slug || "", logoUrl: business?.logoUrl || "", planId: business?.planId || "" }); }, [business?.id, business?.name, business?.slug, business?.logoUrl, business?.planId]);
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  return <>
    <Heading eyebrow="GESTIÓN DEL NEGOCIO" title="Configuración de tu negocio" subtitle="Personaliza la identidad de tu emprendimiento." />
    {business ? <Panel><BusinessRow business={business} /><Detail label="Plan" value={plans.find((item) => item.id === business.planId)?.name || business.planId} /></Panel> : null}
    <Panel title="Datos del emprendimiento">
      <Field label="Nombre del emprendimiento" value={form.name} placeholder="Ej. Artesanías Luna" onChangeText={(value) => change("name", value)} />
      <Field label="Dirección del catálogo" value={form.slug} onChangeText={(value) => change("slug", value)} placeholder="artesanias-luna" />
      <Text style={styles.muted}>Se guardará como /catalogo/{normalizeSlug(form.slug || form.name)}</Text>
      <Field label="URL del logotipo" value={form.logoUrl} onChangeText={(value) => change("logoUrl", value)} placeholder="https://..." />
      {form.logoUrl.startsWith("https://") || form.logoUrl.startsWith("http://") ? <Image source={{ uri: form.logoUrl }} resizeMode="contain" style={styles.logoPreview} /> : null}
      {!business ? <Choice label="Plan de suscripción" value={form.planId} onChange={(value) => change("planId", value)} options={plans.filter((plan) => plan.active).map((plan) => ({ value: plan.id, label: `${plan.name} · ${Math.round(plan.commissionRate * 100)}%` }))} /> : null}
      <Action label={business ? "Guardar cambios" : "Registrar emprendimiento"} disabled={busy} onPress={() => act(() => managementService.saveBusiness(ownerId, business, form), "Negocio guardado correctamente.")} />
    </Panel>
  </>;
}

function Categories({ data, act, busy, setSection }) {
  const { styles } = useAppStyles(makeStyles);
  const { business, categories = [] } = data;
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editingName, setEditingName] = useState("");
  if (!business) return <BusinessRequired setSection={setSection} />;
  return <>
    <Heading eyebrow="GESTIÓN DEL NEGOCIO" title="Categorías" subtitle="Organiza los productos de tu catálogo." />
    <Panel title="Nueva categoría">
      <Field label="Nombre de la categoría" value={name} onChangeText={setName} placeholder="Ej. Accesorios" />
      <Action label="Crear categoría" disabled={busy || !name.trim()} onPress={() => act(() => managementService.createCategory(business.id, name), "Categoría creada.", () => setName(""))} />
    </Panel>
    <Text style={styles.muted}>{categories.length} categorías registradas</Text>
    {categories.map((item) => <Panel key={item.id} title={item.name}>
      <Detail label="Estado" value={item.active ? "Activa" : "Inactiva"} />
      {editing === item.id ? <>
        <Field label="Nuevo nombre" value={editingName} onChangeText={setEditingName} />
        <Action label="Guardar nombre" disabled={busy} onPress={() => act(() => managementService.updateCategory(item, { name: editingName }), "Categoría actualizada.", () => setEditing(null))} />
        <Action label="Cancelar" secondary onPress={() => setEditing(null)} />
      </> : <Action label="Editar nombre" secondary onPress={() => { setEditing(item.id); setEditingName(item.name); }} />}
      <Action label={item.active ? "Desactivar categoría" : "Activar categoría"} secondary destructive={item.active} disabled={busy} onPress={() => act(() => managementService.updateCategory(item, { active: !item.active }), "Estado actualizado.")} />
    </Panel>)}
  </>;
}

function Products({ data, act, busy, setSection }) {
  const { styles } = useAppStyles(makeStyles);
  const { business, products = [], categories = [], plans = [] } = data;
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  if (!business) return <BusinessRequired setSection={setSection} />;
  const limit = plans.find((plan) => plan.id === business.planId)?.maxActiveProducts;
  const activeCount = products.filter((product) => product.active).length;
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const begin = (product = null) => { setSelected(product); setForm(product ? {
    categoryId: product.categoryId, name: product.name, description: product.description, price: String(product.price), imageUrl: product.imageUrl || "",
  } : { ...emptyProduct, categoryId: categories.find((item) => item.active)?.id || "" }); };
  function toggle(product) {
    Alert.alert("Estado del producto", `¿${product.active ? "Desactivar" : "Publicar"} ${product.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => act(() => managementService.setProductActive(product, !product.active, limit), "Producto actualizado.") },
    ]);
  }
  return <>
    <Heading eyebrow="GESTIÓN DEL NEGOCIO" title="Productos" subtitle={`Productos activos: ${activeCount}/${limit ?? "—"}`} />
    {form ? <Panel title={selected ? "Editar producto" : "Nuevo producto"}>
      <Field label="Nombre" value={form.name} onChangeText={(value) => change("name", value)} />
      <Field label="Descripción" multiline value={form.description} onChangeText={(value) => change("description", value)} />
      <Choice label="Categoría" value={form.categoryId} onChange={(value) => change("categoryId", value)} options={categories.filter((item) => item.active || item.id === form.categoryId).map((item) => ({ value: item.id, label: item.name }))} />
      <Field label="Precio ($)" value={form.price} keyboardType="decimal-pad" onChangeText={(value) => change("price", value)} />
      <Field label="URL de imagen" value={form.imageUrl} onChangeText={(value) => change("imageUrl", value)} />
      <Action label="Guardar producto" disabled={busy} onPress={() => act(() => managementService.saveProduct(business.id, selected, form), "Producto guardado.", () => setForm(null))} />
      <Action label="Cancelar" secondary onPress={() => setForm(null)} />
    </Panel> : <Action label="Crear producto" icon="add" onPress={() => begin()} />}
    {categories.length === 0 ? <Panel title="Faltan categorías"><Text style={styles.muted}>Primero registra una categoría.</Text><Action label="Ir a categorías" secondary onPress={() => setSection("categories")} /></Panel> : null}
    <Field label="Buscar producto" value={search} onChangeText={setSearch} placeholder="Nombre" />
    {products.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((product) => <Panel key={product.id}>
      <View style={styles.productRow}>
        {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.productImage} /> : <View style={styles.productImagePlaceholder} />}
        <View style={styles.productCopy}><Text style={styles.productName}>{product.name}</Text><Text style={styles.muted}>{formatMoney(product.price)}</Text></View>
      </View>
      <Detail label="Categoría" value={categories.find((item) => item.id === product.categoryId)?.name || "No disponible"} />
      <Detail label="Estado" value={product.active ? "Publicado" : "Oculto"} />
      <Action label="Editar" secondary onPress={() => begin(product)} />
      <Action label={product.active ? "Ocultar producto" : "Publicar producto"} secondary destructive={product.active} disabled={busy} onPress={() => toggle(product)} />
    </Panel>)}
  </>;
}

function BusinessRequired({ setSection }) {
  return <>
    <Heading eyebrow="PRIMER PASO" title="Primero configura tu negocio" subtitle="Registra tu emprendimiento para administrar sus datos." />
    <Action label="Configurar negocio" onPress={() => setSection("business")} />
  </>;
}

export function EntrepreneurSections({ section, data, ownerId, setSection, act, busy }) {
  if (section === "dashboard") return <Overview data={data} setSection={setSection} />;
  if (section === "business") return <BusinessSettings data={data} ownerId={ownerId} act={act} busy={busy} />;
  if (section === "categories") return <Categories data={data} setSection={setSection} act={act} busy={busy} />;
  if (section === "products") return <Products data={data} setSection={setSection} act={act} busy={busy} />;
  if (!data.business) return <BusinessRequired setSection={setSection} />;
  if (section === "orders") return <OrdersManagement orders={data.orders} businesses={[data.business]} act={act} busy={busy} />;
  if (section === "sales" || section === "commissions") return <FinancialManagement section={section} orders={data.orders} commissions={data.commissions} businesses={[data.business]} goOrders={() => setSection("orders")} />;
  return null;
}

const makeStyles = (colors) => StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  logoPreview: { width: 80, height: 80, borderRadius: radii.md, backgroundColor: colors.white },
  productRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  productImage: { width: 65, height: 65, borderRadius: radii.md },
  productImagePlaceholder: { width: 65, height: 65, borderRadius: radii.md, backgroundColor: colors.subtle },
  productCopy: { flex: 1 },
  productName: { fontWeight: "800", fontSize: 16, color: colors.ink },
});
