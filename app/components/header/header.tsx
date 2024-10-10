import { Link } from "@remix-run/react";

import { HeaderNav } from "./header-nav";
import { SearchInput } from "../search/search-input";

export const Header = () => {
  return (
    <header className="flex h-[80px] items-center justify-between bg-black px-4">
      <div className="flex items-center gap-2">
        <Link
          className="flex items-center gap-2 text-2xl font-semibold text-white"
          to="/"
        >
          <img
            className="h-12 w-12 md:h-16 md:w-16"
            src="https://res.cloudinary.com/bidhub/image/upload/w_150,h_150/DailyDisc"
            alt="Daily Disc"
          />
          <span>DailyDisc</span>
        </Link>
      </div>
      <div className="hidden w-72 justify-center justify-self-center md:flex lg:w-[550px]">
        <SearchInput />
      </div>
      <HeaderNav />
    </header>
  );
};
