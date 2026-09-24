export const adminMenuItems = [
  { type: "header", text: "ADMINISTRACIÓN" },
  {
    type: "item",
    text: "Panel administrativo",
    href: "/admin",
    icon: "bi bi-speedometer2",
  },
  {
    type: "item",
    text: "Usuarios",
    href: "/admin/usuarios",
    icon: "bi bi-people",
  },
  {
    type: "item",
    text: "Planes",
    href: "/admin/planes",
    icon: "bi bi-card-checklist",
  },
  {
    type: "item",
    text: "Pedidos",
    href: "/orders",
    icon: "bi bi-bag-check",
  },
  {
    type: "item",
    text: "Ventas",
    href: "/admin/ventas",
    icon: "bi bi-graph-up-arrow",
  },
  {
    type: "item",
    text: "Comisiones",
    href: "/admin/comisiones",
    icon: "bi bi-cash-coin",
  },
];

export const entrepreneurMenuItems = [
  { type: "header", text: "MI EMPRENDIMIENTO" },
  {
    type: "item",
    text: "Panel principal",
    href: "/emprendedor",
    icon: "bi bi-speedometer2",
  },
  {
    type: "group",
    text: "Gestión del negocio",
    icon: "bi bi-shop",
    children: [
      {
        type: "item",
        text: "Configuración de tu negocio",
        href: "/emprendedor/negocio",
        icon: "bi bi-circle",
      },
      {
        type: "item",
        text: "Categorías",
        href: "/emprendedor/categorias",
        icon: "bi bi-circle",
      },
      {
        type: "item",
        text: "Productos",
        href: "/emprendedor/productos",
        icon: "bi bi-circle",
      },
    ],
  },
  {
    type: "item",
    text: "Pedidos",
    href: "/orders",
    icon: "bi bi-bag-check",
  },
  { type: "header", text: "ANÁLISIS" },
  {
    type: "item",
    text: "Reportes",
    href: "/emprendedor/reportes",
    icon: "bi bi-bar-chart-line",
  },
  {
    type: "item",
    text: "Estado de cuenta",
    href: "/emprendedor/estado-cuenta",
    icon: "bi bi-receipt",
  },
];

export const customerMenuItems = [
  { type: "header", text: "MI CUENTA" },
  {
    type: "item",
    text: "Mi inicio",
    href: "/cliente",
    icon: "bi bi-house-door",
  },
  {
    type: "item",
    text: "Explorar negocios",
    href: "/",
    icon: "bi bi-shop",
  },
  {
    type: "item",
    text: "Revisar mi compra",
    href: "/cliente/carrito",
    icon: "bi bi-cart3",
  },
  {
    type: "item",
    text: "Mis pedidos",
    href: "/cliente#mis-pedidos",
    icon: "bi bi-bag-check",
  },
  {
    type: "item",
    text: "Mis datos",
    href: "/cliente#mis-datos",
    icon: "bi bi-person-circle",
  },
];
