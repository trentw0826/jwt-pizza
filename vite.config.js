import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    // Instrument code for coverage reporting
    istanbul({
      include: ["src/**/*"],
      exclude: ["node_modules"],
      requireEnv: false,
    }),
  ],
});
