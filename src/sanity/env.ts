function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing environment variable ${name} — see .env.local`);
  return value;
}

export const projectId = required(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, "NEXT_PUBLIC_SANITY_PROJECT_ID");
export const dataset = required(process.env.NEXT_PUBLIC_SANITY_DATASET, "NEXT_PUBLIC_SANITY_DATASET");
export const apiVersion = "2026-10-01";
