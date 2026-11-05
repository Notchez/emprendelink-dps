import assert from "node:assert/strict";
import test from "node:test";
import { createCatalogService } from "../src/services/catalogService.js";

const document = (id, data) => ({ id, data: () => data, exists: () => true });
function dependencies() {
  const docs = {
    businesses: [document("business_1", { name: "Café", active: true })],
    categories: [document("category_1", { active: true }), document("category_2", { active: false })],
    products: [document("product_1", { active: true }), document("product_2", { active: false })],
  };
  return { db: {}, collection: (_db, name) => ({ name }), where: () => ({}), query: (reference) => reference, doc: (_db, name, id) => ({ name, id }), getDoc: async ({ name, id }) => docs[name].find((item) => item.id === id), getDocs: async ({ name }) => ({ docs: docs[name] }) };
}

test("catálogo conserva solo categorías y productos activos", async () => {
  const result = await createCatalogService({ loadDependencies: async () => dependencies() }).getCatalogByBusinessId("business_1");
  assert.deepEqual(result.data.categories.map((item) => item.id), ["cat_all", "category_1"]);
  assert.deepEqual(result.data.products.map((item) => item.id), ["product_1"]);
});

test("errores de Firestore se devuelven en un envelope predecible", async () => {
  const service = createCatalogService({ loadDependencies: async () => { throw new Error("offline"); } });
  assert.equal((await service.getBusinesses()).error.code, "BUSINESS_READ_ERROR");
});
