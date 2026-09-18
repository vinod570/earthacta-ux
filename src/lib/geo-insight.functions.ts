import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import { NODES } from "@/data/explorer-data";
import { createEarthActaAi } from "@/lib/ai-gateway.server";

const InsightInput = z.object({
  placeId: z.string().min(1).max(64),
  category: z.enum(["water", "land", "forest", "minerals", "energy"]),
});

export const generateGeoInsight = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InsightInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Lovable AI is not configured for this project.");

    const node = NODES[data.placeId];
    const records = node
      ? [node[data.category].headline, ...(node[data.category].stats ?? [])].filter(Boolean)
      : [];
    if (!node || records.length === 0) {
      const name = node?.name ?? "this geography";
      return { brief: `No sourced ${data.category} records are available for ${name} yet, so no verified brief can be written.`, generatedAt: new Date().toISOString() };
    }

    const lovable = createEarthActaAi(apiKey);
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system: "You write concise environmental intelligence briefs. Use only the supplied records. Never add facts, numbers, causes, forecasts, or geographic claims. Mention uncertainty when a record is pending, flagged, or missing. Return one plain-text paragraph of no more than 55 words.",
      prompt: `Place: ${node.name}\nCategory: ${data.category}\nDisplayed records:\n${records.map((record) => `- ${record?.label}: ${record?.value} [${record?.status}] — ${record?.cite}`).join("\n")}`,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const brief = (await result.text).trim();
    if (!brief) throw new Error("Lovable AI returned an empty brief.");
    return { brief, generatedAt: new Date().toISOString() };
  });
