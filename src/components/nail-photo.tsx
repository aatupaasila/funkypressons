import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

// Square nail photo on a white ground. The slight zoom hides the Instagram
// carousel arrow on the placeholder screenshots; drop it once real photos land.
export function NailPhoto({ src, alt, className = "", sizes = "(min-width: 768px) 33vw, 50vw", priority }: Props) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-white ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="scale-[1.12] object-cover" />
    </div>
  );
}
