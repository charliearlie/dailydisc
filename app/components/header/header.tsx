import { Link } from "@remix-run/react";
import { HeaderNav } from "./header-nav";

export const Header = () => {
  return (
    <header className="flex h-[80px] items-center bg-black px-4">
      <div className="flex items-center gap-2">
        <Link
          className="flex items-center gap-2 text-2xl font-semibold text-white"
          to="/"
        >
          <img
            className="h-12 w-12 md:h-16 md:w-16"
            src="/DailyDisc.png"
            alt="Daily Disc"
          />
          <span>DailyDisc</span>
        </Link>
      </div>
      <HeaderNav />
    </header>
  );
};
