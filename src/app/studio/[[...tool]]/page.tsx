import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export { metadata, viewport } from "next-sanity/studio";

// The admin: funkypressons.com/studio
export default function StudioPage() {
  return <NextStudio config={config} />;
}
