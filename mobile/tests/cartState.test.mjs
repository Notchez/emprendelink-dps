import assert from "node:assert/strict";
import test from "node:test";

import {
  addCartItem,
  clearCartState,
  createEmptyCartState,
  removeCartItem,
  updateCartItemQuantity,
} from "../src/utils/cartState.js";

const business = { id: "business_a", name: "Negocio A" };
const otherBusiness = { id: "business_b", name: "Negocio B" };
const product = { id: "product_a", name: "Producto A", price: 4 };
const secondProduct = { id: "product_b", name: "Producto B", price: 2 };

function cartWithOneItem() {
  return addCartItem(createEmptyCartState(), product, business, 1);
}

test("clearCartState vacía artículos y olvida el negocio", () => {
  const state = clearCartState(cartWithOneItem());

  assert.deepEqual(state.items, []);
  assert.equal(state.business, null);
});

test("removeCartItem olvida el negocio al eliminar el último producto", () => {
  const state = removeCartItem(cartWithOneItem(), product.id);

  assert.deepEqual(state.items, []);
  assert.equal(state.business, null);
});

test("updateCartItemQuantity con cero olvida el negocio al eliminar el último producto", () => {
  const state = updateCartItemQuantity(cartWithOneItem(), product.id, 0);

  assert.deepEqual(state.items, []);
  assert.equal(state.business, null);
});

test("eliminar uno de varios productos conserva el negocio", () => {
  const withTwoItems = addCartItem(cartWithOneItem(), secondProduct, business, 1);
  const state = removeCartItem(withTwoItems, product.id);

  assert.equal(state.items.length, 1);
  assert.equal(state.business.id, business.id);
});

test("un carrito vacío acepta productos de un negocio distinto", () => {
  const emptied = removeCartItem(cartWithOneItem(), product.id);
  const state = addCartItem(emptied, secondProduct, otherBusiness, 1);

  assert.equal(state.items.length, 1);
  assert.equal(state.business.id, otherBusiness.id);
});
