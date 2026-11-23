import { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { managementService } from "../../services/managementService";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatDate, formatMoney, formatOrderId } from "../../utils/formatters";
import { useAppTheme } from "../../theme";
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

export function FinancialManagement({ section, orders = [], commissions = [], businesses = [], isAdmin, goOrders }) {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState("");
  const delivered = orders.filter((order) => order.status === ORDER_STATUS.DELIVERED);
  const revenue = delivered.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
  const commissionTotal = commissions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const rows = section === "sales" ? delivered : commissions;
  const filtered = rows.filter((item) => `${item.customer?.name || ""} ${item.id} ${item.orderId || ""} ${businesses.find((b) => b.id === item.businessId)?.name || ""}`.toLowerCase().includes(search.toLowerCase()));

  return <>
    <Heading eyebrow={isAdmin ? "ADMINISTRACIÓN" : "MI EMPRENDIMIENTO"} title={section === "sales" ? "Ventas" : "Estado de cuenta · Comisiones"} subtitle="Resumen de importes registrados en pedidos entregados." />
    <Panel title="Resumen financiero">
      <Detail label="Ventas entregadas" value={formatMoney(revenue)} emphasis />
      <Detail label="Pedidos entregados" value={delivered.length} />
      <Detail label="Comisiones generadas" value={formatMoney(commissionTotal)} emphasis />
    </Panel>
    <Field label="Buscar registro" value={search} onChangeText={setSearch} placeholder="Pedido, cliente o negocio" />
    {filtered.length === 0 ? <Panel title="Sin movimientos"><Text style={{ color: colors.muted }}>No hay movimientos para mostrar.</Text></Panel> : null}
    {filtered.map((row) => <Panel key={row.id} title={businesses.find((item) => item.id === row.businessId)?.name || (section === "sales" ? row.customer?.name : "Comisión")}>
      <Detail label="Pedido" value={formatOrderId(section === "sales" ? row.id : row.orderId)} />
      <Detail label="Fecha" value={formatDate(row.deliveredAt || row.createdAt)} />
      {section === "commissions" ? <Detail label="Tasa" value={`${Math.round(Number(row.rate || 0) * 10000) / 100}%`} /> : <Detail label="Cliente" value={row.customer?.name || "Cliente"} />}
      <Detail label={section === "sales" ? "Total vendido" : "Comisión"} value={formatMoney(section === "sales" ? row.subtotal : row.amount)} emphasis />
      {goOrders ? <Action label="Consultar pedidos" secondary onPress={goOrders} /> : null}
    </Panel>)}
  </>;
}
