import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { managementService } from "../../services/managementService";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatDate, formatMoney, formatOrderId } from "../../utils/formatters";
import { useAppTheme } from "../../theme";
import {
  buildDeliveredDates, buildDeliveredSales, buildMonthlyCommissions,
  formatMonthLabel, getMonthOptions, getSalesMonthOptions,
  getSalvadorMonthKey, getUtcMonthKey,
} from "../../utils/financialReports.js";
import { Action, Choice, Detail, Field, Heading, Notice, Panel, Separator } from "./ManagementWidgets";

const transitions = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [], [ORDER_STATUS.CANCELLED]: [],
};

export function getAllowedNextStatuses(status) {
  return transitions[status] || [];
}

const filters = [{ value: "", label: "Todos" }, ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))];

export function OrdersManagement({ orders = [], businesses = [], act, busy }) {
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const selected = orders.find((item) => item.id === selectedId);
  const sorted = useMemo(() => orders.filter((item) => {
    if (filter && item.status !== filter) return false;
    const text = `${item.customer?.name || ""} ${item.id} ${businesses.find((business) => business.id === item.businessId)?.name || ""}`.toLowerCase();
    return text.includes(search.trim().toLowerCase());
  }), [businesses, filter, orders, search]);

  useEffect(() => {
    let active = true;
    if (!selectedId) return undefined;
    setHistoryError("");
    managementService.getOrderHistory(selectedId).then((result) => {
      if (!active) return;
      if (result.success) setHistory(result.data);
      else setHistoryError(result.error.message);
    });
    return () => { active = false; };
  }, [selectedId, orders]);

  function requestStatus(order, status) {
    Alert.alert("Actualizar pedido", `¿Cambiar ${formatOrderId(order.id)} a ${ORDER_STATUS_LABELS[status]}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => act(() => managementService.setOrderStatus(order.id, status), "Estado actualizado correctamente.") },
    ]);
  }

  if (selected) return <>
    <Heading eyebrow="SEGUIMIENTO" title="Detalle del pedido" subtitle={formatOrderId(selected.id)} />
    <Action label="Volver a pedidos" secondary icon="arrow-back" onPress={() => setSelectedId("")} />
    <Panel title={selected.customer?.name || "Cliente"}>
      <Detail label="Estado" value={ORDER_STATUS_LABELS[selected.status] || selected.status} emphasis />
      <Detail label="Fecha" value={formatDate(selected.createdAt)} />
      <Detail label="Negocio" value={businesses.find((item) => item.id === selected.businessId)?.name || selected.businessId} />
      <Detail label="Dirección" value={selected.deliveryAddress} />
      {selected.notes ? <Detail label="Indicaciones" value={selected.notes} /> : null}
      <Separator />
      {selected.items?.map((item, index) => <Detail key={`${item.productId}-${index}`} label={`${item.quantity} × ${item.productName}`} value={formatMoney(item.lineTotal)} />)}
      <Separator />
      <Detail label="Total" value={formatMoney(selected.subtotal)} emphasis />
    </Panel>
    {getAllowedNextStatuses(selected.status).length > 0 ? <Panel title="Actualizar estado">
      {getAllowedNextStatuses(selected.status).map((status) => <Action key={status} label={ORDER_STATUS_LABELS[status]} destructive={status === ORDER_STATUS.CANCELLED} secondary={status === ORDER_STATUS.CANCELLED} disabled={busy} onPress={() => requestStatus(selected, status)} />)}
    </Panel> : null}
    <Panel title="Historial">
      {historyError ? <Notice message={historyError} danger /> : null}
      {history.length === 0 ? <Text style={{ color: colors.muted }}>No hay movimientos registrados.</Text> : history.map((item, index) => (
        <Detail key={`${item.changedAt}-${index}`} label={formatDate(item.changedAt)} value={ORDER_STATUS_LABELS[item.newStatus] || item.newStatus} />
      ))}
    </Panel>
  </>;

  return <>
    <Heading eyebrow="SEGUIMIENTO" title="Pedidos" subtitle="Consulta y administra las compras registradas." />
    <Field label="Buscar cliente, negocio o pedido" value={search} onChangeText={setSearch} placeholder="Buscar pedidos" />
    <Choice label="Estado del pedido" options={filters} value={filter} onChange={setFilter} />
    <Text style={{ color: colors.muted }}>{sorted.length} pedidos</Text>
    {sorted.length === 0 ? <Panel title="Sin pedidos"><Text style={{ color: colors.muted }}>No hay pedidos para estos filtros.</Text></Panel> : null}
    {sorted.map((order) => <Panel key={order.id} title={businesses.find((item) => item.id === order.businessId)?.name || formatOrderId(order.id)}>
      <Detail label="Cliente" value={order.customer?.name || "Cliente"} />
      <Detail label="Creado" value={formatDate(order.createdAt)} />
      <Detail label="Estado" value={ORDER_STATUS_LABELS[order.status] || order.status} emphasis />
      <Detail label="Importe" value={formatMoney(order.subtotal)} emphasis />
      <Action label="Ver pedido" secondary icon="arrow-forward" onPress={() => { setHistory([]); setSelectedId(order.id); }} />
    </Panel>)}
  </>;
}

function PeriodSelect({ label, months, value, onChange }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => financialStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const selected = months.find((item) => item.value === value);
  return <View style={styles.periodField}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Elegir mes" accessibilityHint="Abre la lista de períodos" onPress={() => setOpen(true)} style={styles.periodButton}>
      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
      <Text style={styles.periodText}>{selected?.label || formatMonthLabel(value)}</Text>
      <Ionicons name="chevron-down" size={19} color={colors.muted} />
    </Pressable>
    <Modal visible={open} animationType="fade" transparent statusBarTranslucent onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Cerrar selector" onPress={() => setOpen(false)} />
        <View style={styles.monthDialog}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Elegir período</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setOpen(false)}><Ionicons name="close" size={24} color={colors.ink} /></Pressable>
          </View>
          <FlatList
            data={months}
            keyExtractor={(item) => item.value}
            initialNumToRender={12}
            renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }} onPress={() => { onChange(item.value); setOpen(false); }} style={[styles.monthItem, item.value === value && styles.monthSelected]}>
              <Text style={[styles.monthText, item.value === value && styles.monthSelectedText]}>{item.label}</Text>
              {item.value === value ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </Pressable>}
          />
        </View>
      </View>
    </Modal>
  </View>;
}

function FinanceMetric({ label, amount, caption, primary = false }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => financialStyles(colors), [colors]);
  return <View style={[styles.metric, primary && styles.primaryMetric]}>
    <Text style={[styles.metricLabel, primary && styles.primaryText]}>{label}</Text>
    <Text style={[styles.metricAmount, primary && styles.primaryText]}>{amount}</Text>
    {caption ? <Text style={[styles.metricCaption, primary && styles.primaryCaption]}>{caption}</Text> : null}
  </View>;
}

function RecordDetails({ item, isSales, goOrders }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => financialStyles(colors), [colors]);
  return <View style={styles.record}>
    <Detail label="Pedido" value={formatOrderId(isSales ? item.id : item.orderId)} />
    {isSales ? <Detail label="Fecha del pedido" value={formatDate(item.createdAt)} /> : null}
    <Detail label="Fecha de entrega" value={formatDate(item.deliveredAt || item.createdAt)} />
    {isSales ? <Detail label="Comprador" value={item.customer?.name || "Cliente"} /> : <Detail label="Tasa aplicada" value={`${Math.round(Number(item.rate || 0) * 10000) / 100}%`} />}
    <Detail label={isSales ? "Venta" : "Comisión"} value={formatMoney(isSales ? item.subtotal : item.amount)} emphasis />
    {goOrders ? <Pressable accessibilityRole="button" onPress={goOrders} style={styles.linkRow}><Text style={styles.linkText}>Consultar pedidos</Text><Ionicons name="arrow-forward" size={16} color={colors.primary} /></Pressable> : null}
  </View>;
}

function BusinessFinancialGroup({ business, isSales, goOrders }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => financialStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  return <Panel>
    <View style={styles.businessHeader}>
      <View style={styles.businessHeading}>
        <Text style={styles.businessName}>{business.name}</Text>
        <Text style={styles.description}>{business.count} pedidos {isSales ? "entregados" : "con comisión"}{business.active ? "" : " · Negocio inactivo o eliminado"}</Text>
      </View>
      <Text style={styles.businessTotal}>{formatMoney(business.amount)}</Text>
    </View>
    <Action label={expanded ? "Ocultar detalle" : isSales ? "Ver pedidos" : "Ver comisiones"} secondary icon={expanded ? "chevron-up" : "chevron-down"} onPress={() => { setExpanded((current) => !current); setVisibleCount(12); }} />
    {expanded ? <View style={styles.expanded}>
      {business.records.length === 0 ? <Text style={styles.description}>No hay movimientos en el mes seleccionado.</Text> : business.records.slice(0, visibleCount).map((item) => <RecordDetails key={item.id} item={item} isSales={isSales} goOrders={goOrders} />)}
      {business.records.length > visibleCount ? <Action label={`Mostrar más (${business.records.length - visibleCount} restantes)`} secondary onPress={() => setVisibleCount((current) => current + 12)} /> : null}
    </View> : null}
  </Panel>;
}

export function FinancialManagement({ section, orders = [], commissions = [], businesses = [], isAdmin = false, goOrders }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => financialStyles(colors), [colors]);
  const isSales = section === "sales";
  const timeZone = !isAdmin && isSales ? "America/El_Salvador" : "UTC";
  const [selectedMonth, setSelectedMonth] = useState(() => !isAdmin && isSales ? getSalvadorMonthKey(new Date()) : getUtcMonthKey(new Date()));
  const deliveredDates = useMemo(() => buildDeliveredDates(commissions), [commissions]);
  const months = useMemo(() => isSales
    ? getSalesMonthOptions(orders, deliveredDates, { timeZone })
    : getMonthOptions(commissions.map((item) => item.createdAt)), [isSales, orders, commissions, deliveredDates, timeZone]);
  const salesLifetime = useMemo(() => buildDeliveredSales(orders, businesses, { deliveredDates, timeZone }), [orders, businesses, deliveredDates, timeZone]);
  const salesMonth = useMemo(() => buildDeliveredSales(orders, businesses, { month: selectedMonth, deliveredDates, timeZone }), [orders, businesses, selectedMonth, deliveredDates, timeZone]);
  const commissionReport = useMemo(() => buildMonthlyCommissions(commissions, businesses, selectedMonth), [commissions, businesses, selectedMonth]);
  const [search, setSearch] = useState("");
  const groups = (isSales ? salesMonth : commissionReport).businesses.filter((business) => business.name.toLowerCase().includes(search.trim().toLowerCase()));
  const periodName = formatMonthLabel(selectedMonth);
  return <>
    <Heading
      eyebrow={isAdmin ? "PANEL DEL ADMINISTRADOR" : "PANEL DEL EMPRENDEDOR"}
      title={isSales ? (isAdmin ? "Ventas entregadas" : "Ventas") : (isAdmin ? "Comisiones de EmprendeLink" : "Comisiones")}
      subtitle={isSales ? "Consulta las ventas entregadas por mes y el acumulado histórico. Los pedidos cancelados no se contabilizan." : "Consulta las comisiones generadas al entregar pedidos, con su histórico y detalle por mes."}
    />
    <View style={styles.metrics}>
      {isSales ? <>
        <FinanceMetric primary label="Ventas totales entregadas" amount={formatMoney(salesLifetime.total)} caption={`Acumulado histórico · ${salesLifetime.count} pedidos entregados`} />
        <FinanceMetric label={`Ventas de ${periodName} (${isAdmin ? "UTC" : "El Salvador"})`} amount={formatMoney(salesMonth.total)} caption={`${salesMonth.count} pedidos entregados en el período`} />
        {isAdmin ? <FinanceMetric label="Emprendimientos registrados" amount={String(businesses.length)} /> : null}
      </> : <>
        <FinanceMetric primary label={`Comisiones de ${periodName} (UTC)`} amount={formatMoney(commissionReport.monthlyTotal)} caption={`${commissionReport.count} pedidos generaron comisión en este período`} />
        <FinanceMetric label="Comisiones históricas" amount={formatMoney(commissionReport.lifetimeTotal)} caption="Acumulado de todos los períodos" />
        {isAdmin ? <FinanceMetric label="Emprendimientos registrados" amount={String(businesses.length)} /> : null}
      </>}
    </View>
    <Panel title={isAdmin || isSales ? "Elegir período" : "Detalle de comisiones"} subtitle={isSales ? "El filtro muestra las ventas entregadas en ese mes. El acumulado histórico no cambia." : "Selecciona un período para consultar los pedidos que generaron comisión. El acumulado histórico no cambia."}>
      <PeriodSelect label={isSales ? "Mes de venta" : "Mes de comisión (UTC)"} months={months} value={selectedMonth} onChange={setSelectedMonth} />
      <Text style={styles.description}>Se muestran los últimos 12 meses y los períodos anteriores con movimientos.</Text>
    </Panel>
    {isAdmin ? <>
      <Panel title={`${isSales ? "Ventas" : "Comisiones"} por emprendimiento · ${periodName}`} subtitle={isSales ? "Abre cada negocio para consultar los pedidos entregados en el período seleccionado." : "Selecciona un emprendimiento para ver las comisiones del período."}>
        <Field label="Buscar emprendimiento" value={search} onChangeText={setSearch} placeholder="Nombre del negocio" />
        {groups.length === 0 ? <Text style={styles.description}>No hay negocios ni registros para mostrar.</Text> : null}
      </Panel>
      {groups.map((business) => <BusinessFinancialGroup key={`${section}-${selectedMonth}-${business.id}`} business={business} isSales={isSales} goOrders={goOrders} />)}
    </> : <Panel title={isSales ? `Pedidos entregados · ${periodName}` : `Comisiones del mes · ${periodName}`} subtitle={isSales ? "Pedidos entregados en el período seleccionado." : "Pedidos que generaron comisión en el período."}>
      {groups.every((business) => business.count === 0) ? <Text style={styles.description}>No hay movimientos en el período seleccionado.</Text> : groups.flatMap((business) => business.records).map((record) => <RecordDetails key={record.id} item={record} isSales={isSales} goOrders={goOrders} />)}
    </Panel>}
  </>;
}

const financialStyles = (colors) => StyleSheet.create({
  metrics: { gap: 12 },
  metric: { gap: 9, padding: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14 },
  primaryMetric: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  metricLabel: { color: colors.muted, fontSize: 15 },
  metricAmount: { color: colors.ink, fontSize: 29, fontWeight: "900" },
  metricCaption: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  primaryText: { color: colors.white },
  primaryCaption: { color: "#DBEAFE" },
  description: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  periodField: { gap: 8 },
  periodButton: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 9, backgroundColor: colors.background, minHeight: 50, paddingHorizontal: 14 },
  periodText: { flex: 1, color: colors.ink, fontWeight: "700", fontSize: 16 },
  overlay: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" },
  monthDialog: { backgroundColor: colors.surface, borderRadius: 16, width: "100%", maxHeight: "78%", overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  dialogHeader: { padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.border },
  dialogTitle: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  monthItem: { minHeight: 52, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  monthSelected: { backgroundColor: colors.primarySoft },
  monthText: { color: colors.ink, fontSize: 15 },
  monthSelectedText: { color: colors.primaryDark, fontWeight: "800" },
  businessHeader: { gap: 8 },
  businessHeading: { flex: 1, gap: 4 },
  businessName: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  businessTotal: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  expanded: { gap: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  record: { gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, backgroundColor: colors.background },
  linkRow: { alignSelf: "flex-start", flexDirection: "row", gap: 7, alignItems: "center", paddingVertical: 6 },
  linkText: { color: colors.primaryDark, fontWeight: "800", fontSize: 14 },
});
