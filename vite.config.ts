// Build config for self-hosting on Vercel with your own Supabase project.
// The Lovable preset defaults to Cloudflare; here we target Vercel's runtime.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Route TanStack Start's server entry through src/server.ts (SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
