import { Link } from "@remix-run/react";
import { useUser } from "~/contexts/user-context";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";
import { Button } from "../common/ui/button";

export const Header = () => {
  const user = useUser();
  const isLoggedIn = Boolean(user?.username);
  return (
    <header className="flex h-[80px] items-center bg-black px-4">
      <div className="flex items-center gap-2">
        <Link
          className="flex items-center gap-2 text-2xl font-semibold text-white"
          to="/"
        >
          <img
            className="h-12 w-12 md:h-16 md:w-16"
            src="/public/DailyDisc.png"
            alt="Daily Disc"
          />
          <span className="hidden md:block">DailyDisc</span>
        </Link>
      </div>
      <nav className="ml-auto flex items-center space-x-4">
        <Link
          className="text-sm font-medium text-white transition-colors"
          to="/archive"
        >
          Archive
        </Link>
        <Link
          className="text-sm font-medium text-white transition-colors"
          to="/discover"
          prefetch="intent"
        >
          Discover
        </Link>
        {isLoggedIn ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:bg-inherit hover:opacity-90"
              >
                {user.username}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-48 flex-col p-4">
              <Link className="p-2 hover:bg-accent" to="/add-album">
                Submit album
              </Link>
              <Link className="p-2 hover:bg-accent" to="/profile">
                Profile
              </Link>
              <Link className="p-2 hover:bg-accent" to="/logout">
                Logout
              </Link>
            </PopoverContent>
          </Popover>
        ) : (
          <Link
            className="text-sm font-medium text-white transition-colors"
            to="/signup"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};
