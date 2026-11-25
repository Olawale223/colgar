import Image from "next/image";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function Photo({
  src,
  alt,
  className,
  sizes = "(max-width: 620px) 100vw, (max-width: 920px) 720px, 1200px",
  priority = false
}: PhotoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
