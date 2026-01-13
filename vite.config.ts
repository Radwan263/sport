import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

export default defineConfig({
  plugins: [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()],
  resolve: {
    alias: {
      // تعديل الـ Aliases لتكون متوافقة مع هيكلة المجلدات
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: "client", // تحديد مجلد الواجهة
  build: {
    // نغير المخرج ليكون واضح لنيتليفاي داخل مجلد client
    outDir: "../dist", 
    emptyOutDir: true,
  },
});
