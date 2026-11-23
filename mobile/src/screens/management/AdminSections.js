import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { ROLES } from "../../constants/roles";
import { managementService } from "../../services/managementService";
import { formatMoney } from "../../utils/formatters";
import { useAppStyles, spacing } from "../../theme";
import { Action, BusinessRow, Choice, Detail, Field, Heading, Kpi, Panel, Separator } from "./ManagementWidgets";
import { FinancialManagement, OrdersManagement } from "./OrdersManagement";

const emptyPlan = { id: "", name: "", maxActiveProducts: "", commissionRate: "3", active: true };

function Dashboard({ data, setSection }) {
  const { styles } = useAppStyles(makeStyles);
  const { businesses = [], users = [], orders = [], plans = [], commissions = [] } = data;
  const delivered = orders.filter((order) => order.status === "DELIVERED");
  const sales = delivered.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
  const total = commissions.reduce((sum, commission) => sum + Number(commission.amount || 0), 0);
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const thisMonth = commissions.filter((item) => {
    const date = new Date(item.createdAt);
    return !Number.isNaN(date.getTime()) && `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}` === month;
  });
  const byBusiness = businesses.map((business) => ({ ...business, total: thisMonth.filter((item) => item.businessId === business.id).reduce((sum, item) => sum + Number(item.amount || 0), 0) }))
    .sort((first, second) => second.total - first.total);
  const max = Math.max(1, ...byBusiness.map((item) => item.total));

  return <>
    <Heading eyebrow="PANEL DEL ADMINISTRADOR" title="Resumen general" subtitle="Supervisa emprendimientos, ventas, pedidos y comisiones." />
    <Panel title="Comisiones del mes" subtitle="Ingresos de la plataforma · Mes actual (UTC)">
      <Text style={[styles.featuredAmount]}>{formatMoney(thisMonth.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</Text>
      <Text style={styles.muted}>{thisMonth.length} pedidos generaron comisión este mes.</Text>
    </Panel>
    <View style={styles.grid}>
      <Kpi label="Emprendimientos" value={businesses.length} icon="storefront-outline" />
      <Kpi label="Compradores" value={users.filter((item) => item.role === ROLES.CUSTOMER).length} icon="people-outline" />
      <Kpi label="Pedidos" value={orders.length} icon="receipt-outline" />
      <Kpi label="Planes activos" value={plans.filter((item) => item.active).length} icon="card-outline" />
      <Kpi label="Ventas entregadas" value={formatMoney(sales)} icon="trending-up" />
      <Kpi label="Comisiones" value={formatMoney(total)} icon="cash-outline" />
    </View>
    <Panel title="Comisiones por emprendimiento" subtitle="Resultados del mes actual (UTC).">
      {byBusiness.length === 0 ? <Text style={styles.muted}>Aún no se han registrado comisiones.</Text> : byBusiness.map((item) => <View key={item.id} style={styles.chartRow}>
        <Detail label={item.name} value={formatMoney(item.total)} />
        <View style={styles.chartTrack}><View style={[styles.chartBar, { width: `${(item.total / max) * 100}%` }]} /></View>
      </View>)}
      <Action label="Ver comisiones" secondary onPress={() => setSection("commissions")} />
    </Panel>
    <Action label="Gestionar emprendimientos" onPress={() => setSection("businesses")} />
  </>;
}

function Buyers({ users, act, busy }) {
  const { styles } = useAppStyles(makeStyles);
  const [search, setSearch] = useState("");
  const buyers = users.filter((item) => item.role === ROLES.CUSTOMER && `${item.name || ""} ${item.email || ""}`.toLowerCase().includes(search.toLowerCase()));
  function toggle(customer) {
    Alert.alert("Estado del comprador", `${customer.active ? "Desactivar" : "Activar"} la cuenta de ${customer.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => act(() => managementService.setCustomerActive(customer.id, !customer.active), "Estado del comprador actualizado.") },
    ]);
  }
  return <>
    <Heading eyebrow="ADMINISTRACIÓN" title="Compradores" subtitle="Consulta la información y administra el acceso de los clientes." />
    <Field label="Buscar comprador" value={search} onChangeText={setSearch} placeholder="Nombre o correo" />
    <Text style={styles.muted}>{buyers.length} compradores</Text>
    {buyers.map((customer) => <Panel key={customer.id} title={customer.name || "Cliente"}>
      <Detail label="Correo (fijo)" value={customer.email} />
      <Detail label="Teléfono" value={customer.phone} />
      <Detail label="Dirección" value={customer.address} />
      <Detail label="Estado" value={customer.active ? "Activo" : "Inactivo"} />
      <Action label={customer.active ? "Desactivar comprador" : "Activar comprador"} destructive={customer.active} secondary disabled={busy} onPress={() => toggle(customer)} />
    </Panel>)}
    {buyers.length === 0 ? <Panel title="Sin compradores"><Text style={styles.muted}>No hay compradores que coincidan con la búsqueda.</Text></Panel> : null}
  </>;
}

function Businesses({ data, act, busy }) {
  const { styles } = useAppStyles(makeStyles);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const businesses = (data.businesses || []).filter((business) => `${business.name} ${business.slug}`.toLowerCase().includes(search.toLowerCase()));
  const plans = data.plans || [];
  function toggle(business) {
    Alert.alert("Estado del emprendimiento", `¿${business.active ? "Desactivar" : "Activar"} ${business.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => act(() => managementService.setBusinessActive(business, !business.active), "Estado actualizado.") },
    ]);
  }
  function changePlan(business, planId) {
    if (!planId || planId === business.planId) return;
    const plan = plans.find((item) => item.id === planId);
    Alert.alert("Cambiar plan", `¿Asignar ${plan?.name || "este plan"} a ${business.name}? Los pedidos y las comisiones anteriores no cambiarán.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => act(() => managementService.changeBusinessPlan(business.id, planId), "Plan actualizado.") },
    ]);
  }
  return <>
    <Heading eyebrow="ADMINISTRACIÓN" title="Emprendimientos" subtitle="Revisa negocios registrados y controla sus planes." />
    <Field label="Buscar negocio" value={search} onChangeText={setSearch} placeholder="Nombre o catálogo" />
    <Text style={styles.muted}>{businesses.length} emprendimientos</Text>
    {businesses.map((business) => <Panel key={business.id}>
      <BusinessRow business={business} />
      <Detail label="Propietario" value={data.users?.find((item) => item.id === business.ownerId)?.name || business.ownerId} />
      <Detail label="Plan actual" value={plans.find((item) => item.id === business.planId)?.name || business.planId} />
      <Detail label="Productos activos" value={(data.products || []).filter((item) => item.businessId === business.id && item.active).length} />
      <Detail label="Estado" value={business.active ? "Activo" : "Inactivo"} />
      <Choice label="Cambiar plan" options={plans.filter((item) => item.active).map((item) => ({ value: item.id, label: item.name }))} value={selected[business.id] || business.planId} onChange={(value) => setSelected((previous) => ({ ...previous, [business.id]: value }))} disabled={busy} />
      <Action label="Aplicar plan" secondary disabled={busy || !selected[business.id] || selected[business.id] === business.planId} onPress={() => changePlan(business, selected[business.id])} />
      <Separator />
      <Action label={business.active ? "Desactivar catálogo" : "Activar catálogo"} destructive={business.active} secondary disabled={busy} onPress={() => toggle(business)} />
    </Panel>)}
  </>;
}

function Plans({ plans, act, busy }) {
  const { styles } = useAppStyles(makeStyles);
  const [form, setForm] = useState(null);
  const current = plans.find((item) => item.id === form?.id);
  const edit = (plan) => setForm({ id: plan.id, name: plan.name, maxActiveProducts: String(plan.maxActiveProducts), commissionRate: String(Number(plan.commissionRate || 0) * 100), active: plan.active });
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  return <>
    <Heading eyebrow="ADMINISTRACIÓN" title="Planes de suscripción" subtitle="Administra los planes y las tasas aplicadas a pedidos nuevos." />
    {form ? <Panel title={current ? "Editar plan" : "Nuevo plan"}>
      <Field label="Identificador" editable={!current} value={form.id} onChangeText={(value) => change("id", value)} placeholder="plan-pro" />
      <Field label="Nombre" value={form.name} onChangeText={(value) => change("name", value)} />
      <Field label="Productos activos permitidos" keyboardType="number-pad" value={form.maxActiveProducts} onChangeText={(value) => change("maxActiveProducts", value)} />
      <Field label="Comisión (%)" keyboardType="decimal-pad" value={form.commissionRate} onChangeText={(value) => change("commissionRate", value)} />
      <Choice label="Estado" options={[{ value: true, label: "Activo" }, { value: false, label: "Inactivo" }]} value={form.active} onChange={(value) => change("active", value)} />
      <Action label="Guardar plan" disabled={busy} onPress={() => act(() => managementService.savePlan(current, form), "Plan guardado correctamente.", () => setForm(null))} />
      <Action label="Cancelar" secondary onPress={() => setForm(null)} />
    </Panel> : <Action label="Crear plan" icon="add-circle-outline" onPress={() => setForm({ ...emptyPlan })} />}
    <Text style={styles.muted}>{plans.length} planes registrados</Text>
    {plans.map((plan) => <Panel key={plan.id} title={plan.name}>
      <Detail label="Productos activos" value={plan.maxActiveProducts} />
      <Detail label="Comisión" value={`${Math.round(Number(plan.commissionRate) * 10000) / 100}%`} />
      <Detail label="Estado" value={plan.active ? "Activo" : "Inactivo"} />
      <Action label="Editar" secondary onPress={() => edit(plan)} />
      <Action label={plan.active ? "Desactivar" : "Activar"} destructive={plan.active} secondary disabled={busy} onPress={() => act(() => managementService.setPlanActive(plan, !plan.active), "Estado del plan actualizado.")} />
    </Panel>)}
  </>;
}

export function AdminSections({ section, data, setSection, act, busy }) {
  if (section === "dashboard") return <Dashboard data={data} setSection={setSection} />;
  if (section === "buyers") return <Buyers users={data.users || []} act={act} busy={busy} />;
  if (section === "businesses") return <Businesses data={data} act={act} busy={busy} />;
  if (section === "plans") return <Plans plans={data.plans || []} act={act} busy={busy} />;
  if (section === "orders") return <OrdersManagement orders={data.orders} businesses={data.businesses} act={act} busy={busy} />;
  if (section === "sales" || section === "commissions") return <FinancialManagement isAdmin section={section} orders={data.orders} commissions={data.commissions} businesses={data.businesses} goOrders={() => setSection("orders")} />;
  return null;
}

const makeStyles = (colors) => StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  muted: { color: colors.muted, fontSize: 14 },
  chartRow: { gap: spacing.sm },
  chartTrack: { backgroundColor: colors.subtle, height: 12, borderRadius: 8, overflow: "hidden" },
  chartBar: { backgroundColor: colors.primary, height: 12, borderRadius: 8 },
  featuredAmount: { color: colors.primaryDark, fontSize: 32, fontWeight: "900" },
});
