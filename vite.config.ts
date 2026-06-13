import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { configDefaults } from "vitest/config"

const config = defineConfig(({ mode }) => {
  const isTest = mode === "test" || process.env.VITEST === "true"

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      !isTest && cloudflare({ viteEnvironment: { name: "ssr" } }),
      devtools(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
    test: {
      exclude: [...configDefaults.exclude, "tests/e2e/**"],
    },
  }
})

export default config
