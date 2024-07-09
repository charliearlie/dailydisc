import { Link, useLocation } from "@remix-run/react";
import { Calendar, History, Telescope, User } from "lucide-react";
import { useUser } from "~/contexts/user-context";
import { cn } from "~/util/utils";
import { SearchDrawer } from "./search-drawer";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";
import { Button } from "../common/ui/button";

export const BottomNavigation = () => {
  const user = useUser();
  const isLoggedIn = Boolean(user?.username);

  const location = useLocation();

  return (
    <nav className="sticky bottom-0 right-0 grid h-16 w-full grid-cols-5 items-center justify-evenly bg-primary md:hidden">
      <Link
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1 font-light text-primary-foreground hover:bg-accent",
          location.pathname === "/" ? "bg-accent text-primary" : "",
        )}
        to="/"
      >
        <Calendar />
        <span className="text-sm">AOTD</span>
      </Link>
      <Link
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1 font-light text-primary-foreground hover:bg-accent",
          location.pathname === "/discover" ? "bg-accent text-primary" : "",
        )}
        to="/discover"
      >
        <Telescope />
        <span className="text-sm">Discover</span>
      </Link>
      <SearchDrawer />
      <Link
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1 font-light text-primary-foreground hover:bg-accent",
          location.pathname === "/archive" ? "bg-accent text-primary" : "",
        )}
        to="/archive"
      >
        <History />
        <span className="text-sm">Archive</span>
      </Link>
      {isLoggedIn ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-full w-full flex-col items-center justify-center gap-1 font-light text-primary-foreground hover:bg-accent"
            >
              <User />
              <span className="text-sm">{user.username}</span>
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
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-primary-foreground hover:bg-accent"
          to="/signup"
        >
          <User />
          <span className="text-sm">Log in</span>
        </Link>
      )}
    </nav>
  );
};
