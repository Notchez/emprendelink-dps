function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/El_Salvador",
  }).format(date);
}

export function printSalesReport({ businessName, orders, startDate, endDate }) {
  if (typeof window === "undefined") return;
  const reportWindow = window.open("", "_blank", "width=960,height=720");
  if (!reportWindow) throw new Error("El navegador bloqueó la ventana del reporte. Permite ventanas emergentes para generar el PDF.");

  const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const period = startDate || endDate
    ? `${startDate || "Inicio"} a ${endDate || "Hoy"}`
    : "Histórico completo";
  const rows = orders.map((order) => `<tr>
    <td>${escapeHtml(`PED-${String(order.id).slice(0, 8).toUpperCase()}`)}</td>
    <td>${escapeHtml(order.customerName)}</td>
    <td>${escapeHtml(formatDate(order.deliveredAt))}</td>
    <td>${escapeHtml(order.productCount)}</td>
    <td class="amount">${escapeHtml(formatMoney(order.total))}</td>
  </tr>`).join("");

  reportWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8" />
    <title>Ventas - ${escapeHtml(businessName)}</title><style>
    @page { size: A4; margin: 17mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; color: #172033; font-size: 11px; }
    header { padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
    header small { color: #2563eb; font-weight: 700; letter-spacing: 1.5px; }
    h1 { margin: 8px 0 4px; font-size: 25px; }
    header p, .meta { color: #64748b; }
    .summary { display: flex; gap: 18px; margin: 22px 0; }
    .box { flex: 1; padding: 16px; border-radius: 10px; background: #eff6ff; }
    .box span { display: block; color: #475569; }
    .box strong { display: block; margin-top: 8px; color: #1d4ed8; font-size: 22px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; background: #eaf0f9; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #dce5ef; }
    tr { break-inside: avoid; }
    .amount { text-align: right; }
    footer { margin-top: 22px; color: #64748b; font-size: 10px; }
    .printHint { margin: 20px 0; padding: 12px; background: #fef9c3; }
    @media print { .printHint { display: none; } }
    </style></head><body>
    <header><small>EMPRENDELINK · REPORTE DE VENTAS</small>
      <h1>${escapeHtml(businessName)}</h1>
      <p>Pedidos entregados · ${escapeHtml(period)}</p></header>
    <div class="summary"><div class="box"><span>Ventas del período</span><strong>${escapeHtml(formatMoney(total))}</strong></div>
      <div class="box"><span>Pedidos entregados</span><strong>${orders.length}</strong></div></div>
    <table><thead><tr><th>Pedido</th><th>Cliente</th><th>Entrega</th><th>Productos</th><th class="amount">Venta</th></tr></thead>
      <tbody>${rows}</tbody></table>
    <footer>Generado el ${escapeHtml(formatDate(new Date()))}. Valores en USD. Este reporte muestra ventas entregadas, no comisiones.</footer>
    <p class="printHint">Pulsa Ctrl + P y selecciona «Guardar como PDF» si el diálogo no apareció automáticamente.</p>
    </body></html>`);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.setTimeout(() => reportWindow.print(), 250);
}
