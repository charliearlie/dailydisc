import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { LoaderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AlbumPreviewCard } from "~/components/album/album-preview-card";
import {
  getArchiveAlbums,
  getArchivedAlbumCount,
} from "~/services/album.server";
import { getUserFromRequestContext } from "~/services/session";
import { getUserReviewCount } from "~/services/user";

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
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 16;
  const offset = (page - 1) * limit;

  const user = await getUserFromRequestContext(request);
  const archivedAlbums = await getArchiveAlbums(limit, offset);
  const totalArchivedAlbums = await getArchivedAlbumCount();
  const userReviewCount = await getUserReviewCount(user?.id);

  const albumsWithAverageRating = archivedAlbums.map((album) => {
    const totalRating = album.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );

    const averageRating = totalRating / album.reviews.length / 2;

    const usersRating =
      album.reviews.find((review) => review.userId === user?.id)?.rating ||
      null;

    return {
      ...album,
      averageRating: isNaN(averageRating) ? "" : averageRating.toFixed(1),
      usersRating: usersRating ? usersRating / 2 : null,
    };
  });

  return json({
    archivedAlbums: albumsWithAverageRating,
    page,
    totalArchivedAlbums,
    userReviewCount,
  });
};

export default function ArchivePage() {
  const fetcher = useFetcher<typeof loader>();
  const {
    archivedAlbums: initialAlbums,
    page: initialPage,
    totalArchivedAlbums,
    userReviewCount,
  } = useLoaderData<typeof loader>();

  const [albums, setAlbums] = useState(initialAlbums);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialAlbums.length < totalArchivedAlbums,
  );
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          fetcher.load(`/archive?page=${page + 1}`);
        }
      },
      { threshold: 1.0 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, isLoading, fetcher]);

  useEffect(() => {
    if (fetcher.data?.archivedAlbums) {
      setAlbums((prevAlbums) => [
        ...prevAlbums,
        ...(fetcher.data?.archivedAlbums ?? []),
      ]);
      setPage((prevPage) => prevPage + 1);
      setHasMore(
        albums.length + fetcher.data.archivedAlbums.length <
          totalArchivedAlbums,
      );
      setIsLoading(false);
    }
  }, [fetcher.data, totalArchivedAlbums]);

  const ReviewedText = () => {
    if (!userReviewCount) { return null; }
    console.log(userReviewCount, totalArchivedAlbums);
    if (userReviewCount < totalArchivedAlbums) {
      return (
        <h3 className="text-lg">
          So far you have reviewed {userReviewCount} / {totalArchivedAlbums}
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
      <section className="space-y-8 py-8 text-center md:container md:py-16 lg:space-y-12">
        <div className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-4 xl:grid-cols-4">
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
