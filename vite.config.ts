import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import inject from "@rollup/plugin-inject";

// https://vitejs.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [react()],
  optimizeDeps: {
    include: ["buffer"],
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ["buffer", "Buffer"],
          require: ["require", "Require"],
          modules: { Buffer: ["buffer", "Buffer"] },
        }),
      ],
    },
  },
});
