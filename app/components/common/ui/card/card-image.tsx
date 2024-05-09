import { Link } from "@remix-run/react";
import type { ImgHTMLAttributes } from "react";

type CardImageProps = {
  to: string;
};

type Props = ImgHTMLAttributes<HTMLImageElement> & CardImageProps;

export function CardImage({ to, alt, ...imageProps }: Props) {
  return (
    <Link to={to} className="flex w-full cursor-pointer rounded">
      <img
        className="h-64 w-full rounded-t-lg object-cover"
        loading="lazy"
        width="100%"
        alt={alt}
        {...imageProps}
      />
    </Link>
  );
}
