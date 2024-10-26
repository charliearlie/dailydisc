import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { LoaderIcon } from "lucide-react";
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
    if (userReviewCount < totalArchivedAlbums) {
      return (
        <h3 className="text-lg">
          So far you have reviewed {userReviewCount} / {totalArchivedAlbums}{" "}
          albums
        </h3>
      );
    }

    return (
      <h3 className="text-lg">
        ⭐️ You have reviewed all {totalArchivedAlbums} albums selected so far
      </h3>
    );
  };

  return (
    <main className="flex-1">
      <section className="space-y-8 py-8 text-center md:container md:py-16">
        <h1 className="text-3xl font-semibold">Daily Disc archive</h1>
        <h2 className="mt-2 text-xl">
          Discover the albums that have already been picked for the Daily Disc
          album of the day.
        </h2>
        <ReviewedText />
      </section>
      <section className="mx-auto my-auto space-y-8 py-8 text-center md:max-w-screen-2xl md:py-16 lg:space-y-12">
        <div className="px-4 md:container md:px-6">
          <Select
            defaultValue={(searchParams.get("sort") as string) ?? "listenDate"}
            onValueChange={sortAlbums}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sorting options</SelectLabel>
                <SelectItem value="listenDate">Most recent</SelectItem>
                <SelectItem value="averageRating">Rating</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 xl:grid-cols-4">
          {albums.map((album) => (
            <AlbumPreviewCard album={album} key={album.id} />
          ))}
        </div>
        {hasMore ? (
          <div className="flex w-full justify-center" ref={loaderRef}>
            {isLoading && <LoaderIcon className="animate-spin" />}
          </div>
        ) : null}
      </section>
    </main>
  );
}
