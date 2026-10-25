import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Square crop that respects the hotspot set in the Studio */
export function squareImageUrl(source: SanityImageSource, size = 1200) {
  return builder.image(source).width(size).height(size).fit("crop").auto("format").url();
}
