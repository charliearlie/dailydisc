import type { ImgHTMLAttributes } from "react";

export function CardImage({
  alt,
  ...imageProps
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className="aspect-square w-full object-cover drop-shadow"
      loading="lazy"
      width="100%"
      alt={alt}
      {...imageProps}
    />
  );
}
