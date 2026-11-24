import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    files: ["mobile/**/*.{js,jsx}"],
    rules: {
      "jsx-a11y/alt-text": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "mobile/.expo/**", "mobile/dist/**"]),
]);

export default eslintConfig;
