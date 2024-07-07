import { useDebounce } from "use-debounce";
import { Form, Link, useFetcher, useNavigation } from "@remix-run/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/common/ui/drawer";
import { Button } from "../common/ui/button";
import { Search, SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../common/ui/input";
import { Label } from "../common/ui/label";
import type { loader } from "~/routes/api/spotify-search/route";
import { Separator } from "@radix-ui/react-select";

export const SearchDrawer = () => {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof loader>();
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  let [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length <= 2) return;
    fetcher.submit(
      { query: debouncedQuery },
      { method: "GET", action: "/api/spotify-search" },
    );
    setShowResults(true);
  }, [debouncedQuery]);

  useEffect(() => {
    setShowResults(false);
  }, [navigation.location?.pathname]);

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
      <DrawerContent className="h-full">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center justify-between">
            <h3>Search</h3>
            <DrawerClose>
              <X />
            </DrawerClose>
          </DrawerTitle>
          <DrawerDescription>
            <div className="flex h-full flex-col items-center justify-between p-4">
              <div className="flex w-full flex-col space-y-2">
                <Form
                  method="GET"
                  className="flex w-full items-center space-x-2 rounded-md border p-2 text-foreground"
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
                  />
                </Form>
                {showResults && (
                  <ul id="search-list" className="space-y-2">
                    {fetcher?.data?.map(({ id, image, name }, index) => (
                      <li key={`${name}-${index}`}>
                        <Link
                          className="flex items-center space-x-2 p-3 hover:opacity-80"
                          to={encodeURI(`/album/${id}`)}
                        >
                          <img className="rounded-lg" src={image} alt={name} />
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold">
                              {name}
                            </span>
                            <span>Hello</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button size="icon" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
