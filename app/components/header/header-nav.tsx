import { Link } from "@remix-run/react";

import { useUser } from "~/contexts/user-context";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/common/ui/popover";
import { Button } from "~/components/common/ui/button";

export const HeaderNav = () => {
  const user = useUser();
  const isLoggedIn = Boolean(user?.username);
  return (
    <nav className="hidden items-center space-x-4 md:flex">
      <Link
        className="text-sm font-medium text-white transition-colors"
        to="/archive"
      >
        Archive
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
            <Link
              className="p-2 hover:bg-accent"
              to={`/profile/${user.username}`}
            >
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
  );
};
