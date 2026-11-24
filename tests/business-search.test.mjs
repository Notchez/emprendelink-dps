import assert from "node:assert/strict";
import test from "node:test";

import { filterBusinessesBySearch } from "../src/utils/businessSearch.js";

const businesses = [
  { id: "1", name: "Café Salvadoreño", ownerName: "José López", ownerEmail: "jose@ejemplo.com", slug: "cafe-salvadoreno" },
  { id: "2", name: "Artesanías del Valle", ownerName: "María Pérez", ownerEmail: "maria@ejemplo.com", slug: "artesanias-valle" },
  { id: "3", name: "La Tienda", ownerName: "Ana", ownerEmail: "ana@ejemplo.com", slug: "la-tienda" },
];

test("buscar emprendimientos admite nombres sin tildes, propietarios, correos y slug", () => {
  assert.deepEqual(filterBusinessesBySearch(businesses, "cafe").map((item) => item.id), ["1"]);
  assert.deepEqual(filterBusinessesBySearch(businesses, "JOSE LOPEZ").map((item) => item.id), ["1"]);
  assert.deepEqual(filterBusinessesBySearch(businesses, "MARIA@").map((item) => item.id), ["2"]);
  assert.deepEqual(filterBusinessesBySearch(businesses, "artesanias-valle").map((item) => item.id), ["2"]);
  assert.deepEqual(filterBusinessesBySearch(businesses, "sin resultados"), []);
  assert.deepEqual(filterBusinessesBySearch(businesses, " "), businesses);
});
