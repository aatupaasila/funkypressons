import { defineCliConfig } from "sanity/cli";

// Used by `npx sanity …` commands run in this folder
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});
