import { useDebounce } from "use-debounce";
import { Form, Link, useFetcher, useNavigation } from "@remix-run/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/common/ui/drawer";
import { Button } from "../common/ui/button";
import { Search, SearchIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../common/ui/input";
import { Label } from "../common/ui/label";
import type { loader } from "~/routes/api.spotify-search/route";

export const SearchDrawer = () => {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof loader>();
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedQuery.length <= 2) {
      setShowResults(false);
      return;
    }

    fetcher.submit(
      { query: debouncedQuery },
      { method: "GET", action: "/api/spotify-search" },
    );
    setShowResults(true);
  }, [debouncedQuery, fetcher]);

  useEffect(() => {
    setShowResults(false);
  }, [navigation.location?.pathname]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // const noResults = !fetcher?.data?.length && showResults;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="flex h-full w-full flex-col items-center justify-center gap-1 font-light text-primary-foreground hover:bg-accent"
          variant="ghost"
        >
          <Search />
          <span className="text-sm">Search</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full rounded-none">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center justify-between">
            Search
            <DrawerClose>
              <X />
            </DrawerClose>
          </DrawerTitle>
          <div className="flex h-full flex-col items-center justify-between p-1">
            <div className="flex w-full flex-col space-y-2">
              <Form
                method="GET"
                className="flex h-20 w-full items-center space-x-2 rounded-md border p-2 text-foreground"
              >
                <Label htmlFor="query">
                  <span className="sr-only">Search</span>
                  <SearchIcon />
                </Label>
                <Input
                  className="w-full bg-transparent"
                  name="query"
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Search"
                  type="search"
                  value={query}
                  ref={inputRef}
                />
              </Form>
              <ul
                id="search-list"
                className="h-[calc(100vh-240px)] space-y-2 overflow-y-scroll"
              >
                {showResults &&
                  fetcher?.data?.map(
                    ({ id, image, name, primaryArtist }, index) => (
                      <li key={`${name}-${index}`}>
                        <Link
                          className="flex items-center space-x-2 p-1 hover:opacity-80"
                          to={encodeURI(`/album/${id}`)}
                          onClick={() => setOpen(false)}
                        >
                          <img
                            className="h-24 w-24 rounded-lg"
                            src={image}
                            alt={name}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold">{name}</span>
                            <span>{primaryArtist}</span>
                          </div>
                        </Link>
                      </li>
                    ),
                  )}
              </ul>
            </div>
            <Button
              className="mt-4 rounded-full"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X />
            </Button>
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
