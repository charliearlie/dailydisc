import { Link } from "@remix-run/react";
import { Music } from "lucide-react";
import { useUser } from "~/contexts/user-context";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";
import { Button } from "../common/ui/button";

export const Header = () => {
  const user = useUser();
  const isLoggedIn = Boolean(user?.username);
  return (
    <header className="flex h-[60px] items-center border-b border-gray-100 bg-primary px-4 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Link
          className="flex items-center gap-2 text-xl font-semibold text-white"
          to="/"
        >
          <Music className="h-8 w-8" />
          DailyDisc
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
              <Button variant="ghost" className="text-white">
                {user.username}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32">
              <Link to="/profile">Profile</Link>
              <Link to="/logout">Logout</Link>
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
