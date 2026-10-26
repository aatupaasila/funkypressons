import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

// Square nail photo on a white ground. The whole photo shows, with a little
// white margin so nails at the edge of the shot aren't cut off.
export function NailPhoto({ src, alt, className = "", sizes = "(min-width: 768px) 33vw, 50vw", priority }: Props) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-white ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-[4%]" />
    </div>
  );
}
