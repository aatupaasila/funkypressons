import "server-only";
import { createClient } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { apiVersion, dataset, projectId } from "./env";

// The dataset is private (custom requests hold customer details), so every
// read goes through this token-authenticated client on the server.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: "published",
});

/**
 * Cached read. Content refreshes within about a minute, or instantly when the
 * Sanity webhook hits /api/revalidate.
 */
export async function sanityFetch<T>(query: string, params: Record<string, string> = {}): Promise<T> {
  "use cache";
  cacheLife("minutes");
  cacheTag("sanity");
  return client.fetch<T>(query, params);
}
