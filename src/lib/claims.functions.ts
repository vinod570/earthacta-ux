import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ClaimRow = {
  id: string;
  place_id: string;
  place_name: string;
  place_level: "country" | "region" | "district";
  category: "water" | "land" | "forest" | "minerals" | "energy";
  label: string;
  value: string;
  status: "verified" | "pending" | "flagged" | "missing";
  cite: string;
  is_headline: boolean;
  created_at: string;
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listAllClaims = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("claims").select("*").order("place_id").order("category");
  if (error) throw new Error(error.message);
  return (data ?? []) as ClaimRow[];
});

export const getPlaceClaims = createServerFn({ method: "GET" })
  .inputValidator((d: { placeIds: string[] }) => d)
  .handler(async ({ data }) => {
    if (!data.placeIds.length) return [] as ClaimRow[];
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("claims")
      .select("*")
      .in("place_id", data.placeIds)
      .order("category");
    if (error) throw new Error(error.message);
    return (rows ?? []) as ClaimRow[];
  });
