import React from "react";

import { cn } from "~/util/utils";

export const ScrollableRow = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ children, className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn(
        "relative z-0 grid snap-x snap-mandatory auto-cols-[16rem] grid-flow-col gap-2 overflow-x-auto pt-2",
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
});

ScrollableRow.displayName = "ScrollableRow";
