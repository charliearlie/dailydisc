import type { PropsWithChildren } from "react";

import { cn } from "~/util/utils";

type CardContentProps = {
  noPadding?: boolean;
  className?: string;
};

type Props = PropsWithChildren<CardContentProps>;

export default function CardContent({
  children,
  noPadding = false,
  className,
}: Props) {
  return (
    <div className={cn(`py-2 ${noPadding ? "" : "px-2"}`, className)}>
      {children}
    </div>
  );
}
