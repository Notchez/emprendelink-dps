import { ORDER_STATUS } from "@/lib/constants/orderStatus";

// Pedidos de prueba para trabajar el módulo.
export const ordersMock = [
  {
    id: "order-001",
    businessId: "business-001",
    customerId: "customer-001",
    items: [
      {
        productId: "product-001",
        productName: "Producto A",
        quantity: 2,
        unitPrice: 30,
        lineTotal: 60,
      },
      {
        productId: "product-002",
        productName: "Producto B",
        quantity: 1,
        unitPrice: 60,
        lineTotal: 60,
      },
    ],
    subtotal: 120,
    status: ORDER_STATUS.DELIVERED,
    createdAt: "2026-09-01T14:30:00.000Z",
  },
  {
    id: "order-002",
    businessId: "business-001",
    customerId: "customer-002",
    items: [
      {
        productId: "product-003",
        productName: "Producto C",
        quantity: 1,
        unitPrice: 45,
        lineTotal: 45,
      },
    ],
    subtotal: 45,
    status: ORDER_STATUS.PENDING,
    createdAt: "2026-09-06T16:10:00.000Z",
  },
  {
    id: "order-003",
    businessId: "business-001",
    customerId: "customer-003",
    items: [
      {
        productId: "product-004",
        productName: "Producto D",
        quantity: 2,
        unitPrice: 100,
        lineTotal: 200,
      },
    ],
    subtotal: 200,
    status: ORDER_STATUS.DELIVERED,
    createdAt: "2026-09-08T18:45:00.000Z",
  },
  {
    id: "order-004",
    businessId: "business-001",
    customerId: "customer-004",
    items: [
      {
        productId: "product-005",
        productName: "Producto E",
        quantity: 3,
        unitPrice: 25,
        lineTotal: 75,
      },
    ],
    subtotal: 75,
    status: ORDER_STATUS.READY,
    createdAt: "2026-09-12T20:20:00.000Z",
  },
  {
    id: "order-005",
    businessId: "business-001",
    customerId: "customer-005",
    items: [
      {
        productId: "product-006",
        productName: "Producto F",
        quantity: 1,
        unitPrice: 80,
        lineTotal: 80,
      },
    ],
    subtotal: 80,
    status: ORDER_STATUS.CONFIRMED,
    createdAt: "2026-09-15T19:00:00.000Z",
  },
];
