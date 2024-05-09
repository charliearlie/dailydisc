import type { PropsWithChildren } from "react";

export const CardSubHeader = ({ children }: PropsWithChildren) => {
  return (
    <h3 className="flex bg-black px-2 py-1 text-center text-lg font-semibold">
      {children}
    </h3>
  );
};
