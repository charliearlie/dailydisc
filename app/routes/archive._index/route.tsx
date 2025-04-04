import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { LoaderIcon, MusicIcon, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AlbumPreviewCard } from "~/components/album/album-preview-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/common/ui/select";
import {
  getArchiveAlbums,
  getArchivedAlbumCount,
} from "~/services/album.server";
import { getUserFromRequestContext } from "~/services/session";
import { getUserReviewCount } from "~/services/user.server";

export const meta = () => {
  return [
    { title: "Archive | Daily Disc" },
    {
      name: "description",
      content:
        "Explore our Daily Disc archive: a curated collection of albums featured as our daily picks. Discover new music, rediscover classics, and expand your musical horizons.",
    },
    {
      property: "og:image",
      content: "/DailyDisc.png",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort") || "listenDate";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 16;
  const offset = (page - 1) * limit;

  const user = await getUserFromRequestContext(request);
  const archivedAlbums = await getArchiveAlbums({
    limit,
    offset,
    orderBy: sort,
    userId: user?.id,
  });

  const totalArchivedAlbums = await getArchivedAlbumCount();
  const userReviewCount = await getUserReviewCount(user?.id);

  return json({
    archivedAlbums,
    page,
    totalArchivedAlbums,
    userReviewCount,
    hasMore: archivedAlbums.length === limit,
  });
};

export default function ArchivePage() {
  const fetcher = useFetcher<typeof loader>();
  const {
    archivedAlbums: initialAlbums,
    page: initialPage,
    totalArchivedAlbums,
    userReviewCount,
    hasMore: initialHasMore,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [albums, setAlbums] = useState(initialAlbums);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setIsLoading(true);
          const sort = searchParams.get("sort") || "listenDate";
          fetcher.load(`/archive?sort=${sort}&page=${page + 1}`);
        }
      },
      { threshold: 1.0 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, isLoading, hasMore, searchParams, fetcher]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setAlbums((prevAlbums) => {
        const newAlbums = fetcher.data?.archivedAlbums.filter(
          (newAlbum) =>
            !prevAlbums.some((prevAlbum) => prevAlbum.id === newAlbum.id),
        );

        if (fetcher.data?.page === 1) {
          return fetcher.data?.archivedAlbums;
        }
        return [...prevAlbums, ...(newAlbums ?? [])];
      });
      setPage(fetcher.data.page);
      setHasMore(fetcher.data.hasMore);
      setIsLoading(false);
    }
  }, [fetcher.state, fetcher.data]);

  const sortAlbums = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.set("page", "1");
    setSearchParams(params);
    setAlbums([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);

    fetcher.load(`/archive?sort=${value}&page=1`);
  };

  const ReviewedText = () => {
    if (!userReviewCount) {
      return null;
    }

    const progressPercentage = Math.round(
      (userReviewCount / totalArchivedAlbums) * 100,
    );

    return (
      <div className="mx-auto max-w-md rounded-lg border border-border/50 bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">Your review progress</h3>
          <span className="text-sm font-medium">
            {userReviewCount} / {totalArchivedAlbums}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage === 100 && (
          <p className="mt-2 text-center text-sm font-medium text-primary">
            🎉 You've reviewed all albums! Amazing!
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/15">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Daily Disc <span className="text-primary">Archive</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore our collection of albums featured as daily picks. Discover
            new music, revisit classics.
          </p>

          {userReviewCount !== null && userReviewCount !== undefined && (
            <div className="mt-8">
              <ReviewedText />
            </div>
          )}
        </section>

        <section className="mx-auto mb-8 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MusicIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {totalArchivedAlbums} Albums
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card px-3 py-1.5 shadow-sm">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select
                defaultValue={
                  (searchParams.get("sort") as string) ?? "listenDate"
                }
                onValueChange={sortAlbums}
              >
                <SelectTrigger className="border-0 bg-transparent px-0 shadow-none hover:bg-transparent focus:ring-0">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort albums by</SelectLabel>
                    <SelectItem value="listenDate">Most recent</SelectItem>
                    <SelectItem value="averageRating">Highest rated</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => (
              <AlbumPreviewCard album={album} key={album.id} />
            ))}
          </div>

          {hasMore && (
            <div
              className="mt-12 flex w-full items-center justify-center"
              ref={loaderRef}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 shadow-sm">
                  <LoaderIcon className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Loading more albums...
                  </span>
                </div>
              ) : (
                <div className="h-16"></div>
              )}
            </div>
          )}

          {!hasMore && albums.length > 0 && (
            <p className="mt-12 text-center text-sm text-muted-foreground">
              You've reached the end of the archive.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
