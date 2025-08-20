import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

// Exclude generated and dependency folders from linting
const finalConfig = [
  { ignores: [
    ".next/**",
    "node_modules/**",
    "dist/**",
    "build/**",
    ".env",
    ".env.local",
    ".vercel/**",
    ".cache/**",
    ".turbo/**",
    ".vscode/**",
  ] },
  ...eslintConfig,
];

export default finalConfig;
