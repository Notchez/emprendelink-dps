import test from "node:test";
import assert from "node:assert/strict";
import { GET as listOrders, POST as createOrder } from "../src/app/api/orders/route.js";
import { GET as readOrder } from "../src/app/api/orders/[id]/route.js";
import { PATCH as changeStatus } from "../src/app/api/orders/[id]/status/route.js";
import { GET as readHistory } from "../src/app/api/orders/[id]/history/route.js";
import { POST as customerIdentity } from "../src/app/api/customers/route.js";
import { userService } from "../src/services/userService.js";
import { authService } from "../src/services/authService.js";
import { validateProfile, normalizeProfile } from "../src/utils/profileValidation.js";
import { getLoginDestination } from "../src/lib/constants/roles.js";

const profiles = {
  alice: {
    role: "CUSTOMER",
    active: true,
    name: "Alice Test",
    email: "alice@example.com",
    phone: "70000000",
    address: "Calle de prueba 123",
    deliveryInstructions: "Portón azul",
  },
  bob: {
    role: "CUSTOMER",
    active: true,
    name: "Bob Test",
    email: "bob@example.com",
    phone: "71111111",
    address: "Otra calle 456",
    deliveryInstructions: "",
  },
  owner: { role: "ENTREPRENEUR", active: true, name: "Owner Test", email: "owner@example.com" },
  otherOwner: {
    role: "ENTREPRENEUR",
    active: true,
    name: "Other Owner",
    email: "other@example.com",
  },
  admin: { role: "ADMIN", active: true, name: "Admin Test", email: "admin@example.com" },
  disabled: { role: "CUSTOMER", active: false },
};
const documents = {
  ...Object.fromEntries(Object.entries(profiles).map(([id, value]) => [`users/${id}`, value])),
  "businesses/test-shop": { ownerId: "owner", active: true },
  "products/test-product": {
    businessId: "test-shop",
    active: true,
    name: "Producto de prueba",
    price: 12.5,
  },
};
const encode = (data) => ({
  fields: Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "boolean"
        ? { booleanValue: value }
        : typeof value === "number"
          ? { doubleValue: value }
          : { stringValue: value },
    ])
  ),
});
function fixture(t) {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).startsWith("https://identitytoolkit.googleapis.com/")) {
      const id = JSON.parse(options.body).idToken;
      return profiles[id]
        ? Response.json({ users: [{ localId: id, email: profiles[id].email }] })
        : Response.json({}, { status: 400 });
    }
    if (String(url).startsWith("https://firestore.googleapis.com/")) {
      const path = decodeURIComponent(String(url).split("/documents/")[1]);
      return documents[path]
        ? Response.json(encode(documents[path]))
        : Response.json({}, { status: 404 });
    }
    throw new Error(`Unexpected network call: ${url}`);
  });
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
}
function request(path, token, method = "GET", body) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
const draft = () => ({
  businessId: "test-shop",
  customerId: "bob",
  createdBy: "admin",
  items: [{ productId: "test-product", quantity: 2, unitPrice: 0.01, productName: "Forged" }],
  deliveryAddress: "Dirección de prueba 123",
  notes: "Tocar el timbre",
});
const params = (id) => ({ params: Promise.resolve({ id }) });
async function seedOrder(t) {
  fixture(t);
  const response = await createOrder(request("/api/orders", "alice", "POST", draft()));
  assert.equal(response.status, 201);
  return (await response.json()).data;
}

test("all order/customer endpoints reject unauthenticated requests", async (t) => {
  fixture(t);
  for (const response of await Promise.all([
    listOrders(request("/api/orders")),
    createOrder(request("/api/orders", null, "POST", draft())),
    readOrder(request("/api/orders/id"), params("id")),
    readHistory(request("/api/orders/id/history"), params("id")),
    changeStatus(
      request("/api/orders/id/status", null, "PATCH", { status: "CONFIRMED" }),
      params("id")
    ),
    customerIdentity(request("/api/customers", null, "POST", {})),
  ]))
    assert.equal(response.status, 401);
});
test("invalid token and disabled account cannot list orders", async (t) => {
  fixture(t);
  assert.equal((await listOrders(request("/api/orders", "invalid"))).status, 401);
  assert.equal((await listOrders(request("/api/orders", "disabled"))).status, 403);
});
test("order derives customer, author, product name and price on the server", async (t) => {
  const order = await seedOrder(t);
  assert.equal(order.customerId, "alice");
  assert.equal(order.subtotal, 25);
  assert.equal(order.items[0].productName, "Producto de prueba");
  assert.equal(order.customer.phone, "70000000");
  const history = await (
    await readHistory(request("/api/orders/id/history", "alice"), params(order.id))
  ).json();
  assert.equal(history.data[0].changedBy, "alice");
});
test("customer cannot read another customer's order or history", async (t) => {
  const order = await seedOrder(t);
  assert.equal((await readOrder(request("/api/orders/id", "bob"), params(order.id))).status, 404);
  assert.equal(
    (await readHistory(request("/api/orders/id/history", "bob"), params(order.id))).status,
    404
  );
  const ownOrders = await (await listOrders(request("/api/orders", "bob"))).json();
  assert.equal(
    ownOrders.data.some((entry) => entry.customerId !== "bob"),
    false
  );
});
test("customer cannot update any order status", async (t) => {
  const order = await seedOrder(t);
  assert.equal(
    (
      await changeStatus(
        request("/api/orders/id/status", "alice", "PATCH", { status: "CONFIRMED" }),
        params(order.id)
      )
    ).status,
    403
  );
});
test("entrepreneur is restricted to their business", async (t) => {
  const order = await seedOrder(t);
  assert.equal(
    (await listOrders(request("/api/orders?businessId=test-shop", "otherOwner"))).status,
    403
  );
  assert.equal(
    (await readOrder(request("/api/orders/id", "otherOwner"), params(order.id))).status,
    403
  );
  assert.equal((await listOrders(request("/api/orders", "owner"))).status, 400);
  assert.equal(
    (await listOrders(request("/api/orders?businessId=test-shop", "owner"))).status,
    200
  );
});
test("owner status change ignores a forged changedBy and rejects invalid transitions", async (t) => {
  const order = await seedOrder(t);
  assert.equal(
    (
      await changeStatus(
        request("/api/orders/id/status", "owner", "PATCH", { status: "DELIVERED" }),
        params(order.id)
      )
    ).status,
    409
  );
  const response = await changeStatus(
    request("/api/orders/id/status", "owner", "PATCH", { status: "CONFIRMED", changedBy: "admin" }),
    params(order.id)
  );
  assert.equal(response.status, 200);
  const history = await (
    await readHistory(request("/api/orders/id/history", "alice"), params(order.id))
  ).json();
  assert.equal(history.data[0].changedBy, "owner");
});
test("administrator can list and read orders but cannot impersonate a buying customer", async (t) => {
  const order = await seedOrder(t);
  assert.equal((await listOrders(request("/api/orders", "admin"))).status, 200);
  assert.equal((await readOrder(request("/api/orders/id", "admin"), params(order.id))).status, 200);
  assert.equal((await createOrder(request("/api/orders", "admin", "POST", draft()))).status, 403);
});
test("noninteger quantities, duplicate products and foreign products are rejected", async (t) => {
  fixture(t);
  const bad = draft();
  bad.items[0].quantity = 1.5;
  assert.equal((await createOrder(request("/api/orders", "alice", "POST", bad))).status, 400);
  const duplicate = draft();
  duplicate.items.push({ ...duplicate.items[0] });
  assert.equal((await createOrder(request("/api/orders", "alice", "POST", duplicate))).status, 400);
  const missing = draft();
  missing.items[0].productId = "missing";
  assert.equal((await createOrder(request("/api/orders", "alice", "POST", missing))).status, 409);
});
test("legacy customer endpoint returns only the signed-in identity", async (t) => {
  fixture(t);
  const response = await customerIdentity(
    request("/api/customers", "alice", "POST", { id: "bob", name: "Forged" })
  );
  assert.equal((await response.json()).data.id, "alice");
});
test("public registration and profile creation never accept ADMIN", async () => {
  await assert.rejects(authService.register({ role: "ADMIN" }), /permitido/);
  await assert.rejects(
    userService.createProfile({ uid: "alice", email: "alice@example.com" }, { role: "ADMIN" }),
    /Cliente o Emprendedor/
  );
});
test("customer fields are required, delivery instructions optional, and redirect restricted", () => {
  const valid = normalizeProfile(
    { ...profiles.alice, deliveryInstructions: "" },
    profiles.alice.email
  );
  assert.equal(validateProfile(valid, "CUSTOMER"), null);
  for (const field of ["name", "email", "phone", "address"])
    assert.ok(validateProfile({ ...valid, [field]: "" }, "CUSTOMER"));
  assert.equal(getLoginDestination("CUSTOMER", "/checkout"), "/checkout");
  assert.equal(getLoginDestination("CUSTOMER", "https://example.com"), "/cliente");
  assert.equal(getLoginDestination("ADMIN", "/checkout"), "/admin");
});
