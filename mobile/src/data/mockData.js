import { ORDER_STATUS } from "../constants/orderStatus.js";
import { ROLES } from "../constants/roles.js";

export const demoCredentials = Object.freeze({
  email: "cliente@emprendelink.demo",
  password: "Demo1234",
});

export const mockUsers = [
  {
    id: "usr_demo_customer",
    name: "Ana Martínez",
    email: demoCredentials.email,
    role: ROLES.CUSTOMER,
    phone: "7777-1234",
    address: "Colonia Escalón, San Salvador",
    deliveryInstructions: "Llamar al llegar.",
    createdAt: "2026-09-03T14:30:00.000Z",
    active: true,
  },
];

export const mockBusinesses = [
  {
    id: "business_cafe",
    ownerId: "owner_cafe",
    name: "Café Raíces",
    slug: "cafe-raices",
    logoUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=500&auto=format&fit=crop",
    planId: "plan_growth",
    active: true,
  },
  {
    id: "business_bakery",
    ownerId: "owner_bakery",
    name: "Dulce Hogar",
    slug: "dulce-hogar",
    logoUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500&auto=format&fit=crop",
    planId: "plan_growth",
    active: true,
  },
  {
    id: "business_crafts",
    ownerId: "owner_crafts",
    name: "Manos Salvadoreñas",
    slug: "manos-salvadorenas",
    logoUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=500&auto=format&fit=crop",
    planId: "plan_basic",
    active: true,
  },
];

export const mockCategories = [
  { id: "cat_all", businessId: null, name: "Todos", active: true },
  { id: "cat_coffee", businessId: "business_cafe", name: "Café", active: true },
  { id: "cat_drinks", businessId: "business_cafe", name: "Bebidas", active: true },
  { id: "cat_bread", businessId: "business_bakery", name: "Panadería", active: true },
  { id: "cat_dessert", businessId: "business_bakery", name: "Postres", active: true },
  { id: "cat_textile", businessId: "business_crafts", name: "Textiles", active: true },
  { id: "cat_decor", businessId: "business_crafts", name: "Decoración", active: true },
];

export const mockProducts = [
  {
    id: "prod_coffee_bag",
    businessId: "business_cafe",
    categoryId: "cat_coffee",
    name: "Café de altura",
    description: "Café salvadoreño tostado medio, bolsa de 340 g.",
    price: 8.5,
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=700&auto=format&fit=crop",
    active: true,
  },
  {
    id: "prod_cold_brew",
    businessId: "business_cafe",
    categoryId: "cat_drinks",
    name: "Cold brew artesanal",
    description: "Extracción en frío, suave y refrescante.",
    price: 3.75,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=700&auto=format&fit=crop",
    active: true,
  },
  {
    id: "prod_croissant",
    businessId: "business_bakery",
    categoryId: "cat_bread",
    name: "Croissant de mantequilla",
    description: "Hojaldre artesanal horneado cada mañana.",
    price: 2.25,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700&auto=format&fit=crop",
    active: true,
  },
  {
    id: "prod_cake",
    businessId: "business_bakery",
    categoryId: "cat_dessert",
    name: "Pastel de chocolate",
    description: "Porción húmeda de cacao con cobertura cremosa.",
    price: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&auto=format&fit=crop",
    active: true,
  },
  {
    id: "prod_tote",
    businessId: "business_crafts",
    categoryId: "cat_textile",
    name: "Bolsa tejida",
    description: "Pieza reutilizable elaborada a mano por artesanas locales.",
    price: 16,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop",
    active: true,
  },
  {
    id: "prod_planter",
    businessId: "business_crafts",
    categoryId: "cat_decor",
    name: "Maceta pintada",
    description: "Maceta de barro con acabado artesanal.",
    price: 12,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=700&auto=format&fit=crop",
    active: true,
  },
];

export const mockOrders = [
  {
    id: "order_demo_1002",
    businessId: "business_bakery",
    customerId: "usr_demo_customer",
    customer: { name: "Ana Martínez", phone: "7777-1234", email: demoCredentials.email },
    items: [
      {
        productId: "prod_croissant",
        productName: "Croissant de mantequilla",
        quantity: 2,
        unitPrice: 2.25,
        lineTotal: 4.5,
      },
    ],
    subtotal: 4.5,
    deliveryAddress: "Colonia Escalón, San Salvador",
    notes: "Llamar al llegar.",
    status: ORDER_STATUS.PREPARING,
    createdAt: "2026-10-15T16:20:00.000Z",
    commissionPlanId: "plan_growth",
    commissionPlanName: "Crecimiento",
    commissionRate: 0.05,
  },
  {
    id: "order_demo_1001",
    businessId: "business_cafe",
    customerId: "usr_demo_customer",
    customer: { name: "Ana Martínez", phone: "7777-1234", email: demoCredentials.email },
    items: [
      {
        productId: "prod_coffee_bag",
        productName: "Café de altura",
        quantity: 1,
        unitPrice: 8.5,
        lineTotal: 8.5,
      },
    ],
    subtotal: 8.5,
    deliveryAddress: "Colonia Escalón, San Salvador",
    notes: null,
    status: ORDER_STATUS.DELIVERED,
    createdAt: "2026-10-08T18:05:00.000Z",
    commissionPlanId: "plan_growth",
    commissionPlanName: "Crecimiento",
    commissionRate: 0.05,
  },
];
