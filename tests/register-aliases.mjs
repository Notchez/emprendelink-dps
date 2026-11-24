import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, nextResolve) {
    // Route tests run outside Next.js; keep the server-only marker inert in tests only.
    if (specifier === "server-only")
      return { url: "data:text/javascript,export {};", shortCircuit: true };
    if (specifier.startsWith("@/"))
      return nextResolve(new URL(`../src/${specifier.slice(2)}.js`, import.meta.url).href, context);
    return nextResolve(specifier, context);
  },
});
