import assert from "node:assert/strict";
import test from "node:test";

import { darkColors, getColors, lightColors } from "../src/theme/palette.js";

test("la paleta sigue la preferencia del sistema y cae a claro si no hay preferencia", () => {
  assert.strictEqual(getColors("dark"), darkColors);
  assert.strictEqual(getColors("light"), lightColors);
  assert.strictEqual(getColors(null), lightColors);
});

test("ambos temas ofrecen los mismos colores semánticos para todas las pantallas", () => {
  assert.deepEqual(Object.keys(lightColors).sort(), Object.keys(darkColors).sort());
  assert.equal(lightColors.background, "#F5F6F8");
  assert.equal(darkColors.background, "#111827");
  assert.equal(lightColors.primary, darkColors.primary);
  assert.notEqual(lightColors.ink, darkColors.ink);
});
