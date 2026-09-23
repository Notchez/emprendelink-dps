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
