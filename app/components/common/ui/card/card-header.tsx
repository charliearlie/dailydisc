import type { PropsWithChildren } from "react";

export function CardHeader({ children }: PropsWithChildren) {
  return (
    <h2 className="flex rounded-t-lg bg-gray-900 p-2 text-center text-2xl font-bold">
      {children}
    </h2>
  );
}
