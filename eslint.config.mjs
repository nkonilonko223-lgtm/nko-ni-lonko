import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // 🚀 LE RADAR 1/1000 (Règles strictes DOGME 2)
  {
    rules: {
      // 🛡️ Interdit les console.log en production, mais garde les alertes de sécurité
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // 🛡️ Tolérance ZÉRO pour le typage faible (Strictement aucun any)
      "@typescript-eslint/no-explicit-any": "error",
      
      // 🛡️ Interdit de forcer le silence du compilateur
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
]);

export default eslintConfig;