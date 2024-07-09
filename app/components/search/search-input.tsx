import { Form, Link, useFetcher, useNavigation } from "@remix-run/react";
import { useCombobox } from "downshift";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { loader } from "~/routes/api.spotify-search/route";

import { Input } from "~/components/common/ui/input";

import { Button } from "../common/ui/button";
import { Card } from "../common/ui/card";
import { Separator } from "@radix-ui/react-select";

export function SearchInput() {
  const fetcher = useFetcher<typeof loader>();
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
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

  const { getInputProps, getMenuProps } = useCombobox({
    items: fetcher.data || [],
  });

  const shouldShowAllResultsButton = fetcher?.data?.length === 3;

  return (
    <div className="relative w-full">
      <Form
        action="/search"
        method="GET"
        className="flex w-full items-center space-x-2 rounded-md bg-black p-2 text-white"
      >
        <label htmlFor="query" className="sr-only">
          Search
        </label>
        <SearchIcon />
        <Input
          className="fit-medium w-full rounded-md border border-slate-400 bg-black text-sm ring-offset-background placeholder:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...getInputProps({
            "aria-expanded":
              fetcher.data?.length && fetcher?.data?.length > 0 ? true : false,
            name: "query",
            onFocus: () => {
              if (debouncedQuery.length >= 2) {
                setShowResults(true);
              }
            },
            onBlur: () => setShowResults(false),
            onChange: (event) => setQuery(event.currentTarget.value),
            placeholder: "Search",
            type: "search",
            value: query,
          })}
        />
      </Form>
      {showResults && fetcher.data?.length && (
        <Card
          className="absolute z-50 max-h-72 w-full overflow-y-scroll"
          {...getMenuProps()}
        >
          <ul id="search-list" className="space-y-2">
            {fetcher?.data?.map(({ id, image, name, primaryArtist }, index) => (
              <li key={`${name}-${index}`}>
                <Link
                  className="flex items-center space-x-2 p-1 hover:opacity-80"
                  to={encodeURI(`/album/${id}`)}
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
            ))}
          </ul>
          {shouldShowAllResultsButton && (
            <>
              <Separator />
              <Button className="w-full text-foreground" asChild variant="link">
                <Link to={`/search?query=${debouncedQuery}`}>
                  See all results
                </Link>
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
