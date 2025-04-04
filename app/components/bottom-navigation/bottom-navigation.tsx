import { Link, useLocation } from "@remix-run/react";
import { Calendar, History, Search, User } from "lucide-react";
import { Button } from "../common/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";
import { useUser } from "~/contexts/user-context";
import { cn } from "~/util/utils";

export const BottomNavigation = () => {
  const user = useUser();
  const isLoggedIn = Boolean(user?.username);
  const location = useLocation();

  return (
    <nav className="sticky bottom-0 right-0 z-50 w-full border-t border-border/30 bg-background/80 backdrop-blur-md md:hidden">
      <div className="grid h-16 w-full grid-cols-3 items-center justify-evenly">
        <Link
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-primary",
            location.pathname === "/" ? "text-primary" : "",
          )}
          to="/"
        >
          <div
            className={cn(
              "rounded-full p-1.5",
              location.pathname === "/" ? "bg-primary/10" : "",
            )}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Today</span>
        </Link>

        <Link
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-primary",
            location.pathname.startsWith("/archive") ? "text-primary" : "",
          )}
          to="/archive"
        >
          <div
            className={cn(
              "rounded-full p-1.5",
              location.pathname.startsWith("/archive") ? "bg-primary/10" : "",
            )}
          >
            <History className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Archive</span>
        </Link>

        {isLoggedIn ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-primary",
                  location.pathname.startsWith("/profile")
                    ? "text-primary"
                    : "",
                )}
              >
                <div
                  className={cn(
                    "rounded-full p-1.5",
                    location.pathname.startsWith("/profile")
                      ? "bg-primary/10"
                      : "",
                  )}
                >
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">Profile</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-48 flex-col rounded-lg border-border/50 p-0 shadow-lg">
              <Link
                className="flex items-center gap-2 p-3 text-sm transition-colors hover:bg-muted"
                to={`/profile/${user.username}`}
              >
                <User className="h-4 w-4" />
                View Profile
              </Link>
              <Link
                className="flex items-center gap-2 p-3 text-sm transition-colors hover:bg-muted"
                to="/add-album"
              >
                <Calendar className="h-4 w-4" />
                Submit Album
              </Link>
              <Link
                className="flex items-center gap-2 p-3 text-sm text-red-500 transition-colors hover:bg-muted"
                to="/logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-log-out"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                Log Out
              </Link>
            </PopoverContent>
          </Popover>
        ) : (
          <Link
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-primary",
              location.pathname === "/signup" ? "text-primary" : "",
            )}
            to="/signup"
          >
            <div
              className={cn(
                "rounded-full p-1.5",
                location.pathname === "/signup" ? "bg-primary/10" : "",
              )}
            >
              <User className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Log In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
