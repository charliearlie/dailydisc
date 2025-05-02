import { useEffect, useRef, useState } from "react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { desc, eq, sql } from "drizzle-orm";
import { LoaderIcon } from "lucide-react";

import { ReviewCard } from "~/components/reviews/review-card";
import { db } from "~/drizzle/db.server";
import { albums, reviews, users } from "~/drizzle/schema.server";
import { getUserFromRequestContext } from "~/services/session";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const user = await getUserFromRequestContext(request);

  const recentReviews = await db.query.reviews.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          email: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      album: {
        columns: {
          id: true,
          title: true,
          image: true,
          year: true,
          genre: true,
        },
        with: {
          artistsToAlbums: {
            with: {
              artist: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
    limit,
    offset,
  });

  // Get total count to determine if there are more reviews
  const [{ count: totalCount }] = await db
    .select({
      count: sql<number>`count(*)`.as("count"),
    })
    .from(reviews);

  const hasMore = offset + recentReviews.length < totalCount;

  // Enrich reviews with album artists
  const enrichedReviews = recentReviews.map((review) => ({
    ...review,
    album: {
      ...review.album,
      artists: review.album.artistsToAlbums.map((a) => a.artist),
    },
  }));

  return json({
    recentReviews: enrichedReviews,
    page,
    hasMore,
    isLoggedIn: !!user,
  });
};

export default function RecentActivityPage() {
  const fetcher = useFetcher<typeof loader>();
  const {
    recentReviews: initialReviews,
    page: initialPage,
    hasMore: initialHasMore,
  } = useLoaderData<typeof loader>();

  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const loaderRef = useRef(null);

  // Intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setIsLoading(true);
          fetcher.load(`/recent-activity?page=${page + 1}`);
        }
      },
      { threshold: 1.0 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, isLoading, hasMore, fetcher]);

  // Update state when new data is loaded
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setReviews((prevReviews) => {
        const newReviews = fetcher.data?.recentReviews.filter(
          (newReview) =>
            !prevReviews.some((prevReview) => prevReview.id === newReview.id),
        );

        if (fetcher.data?.page === 1) {
          return fetcher.data?.recentReviews;
        }
        return [...prevReviews, ...(newReviews ?? [])];
      });
      setPage(fetcher.data.page);
      setHasMore(fetcher.data.hasMore);
      setIsLoading(false);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/15">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Recent <span className="text-primary">Activity</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            See what the community has been listening to and reviewing.
          </p>
        </div>

        <section className="mx-auto max-w-3xl">
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <img
                      src={review.album.image || ""}
                      alt={review.album.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{review.album.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {review.album.artists
                          .map((artist) => artist.name)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium">
                    <span className="text-primary">{review.album.year}</span>
                  </div>
                </div>
                <ReviewCard review={review} />
              </div>
            ))}

            {hasMore && (
              <div
                className="mt-8 flex w-full items-center justify-center"
                ref={loaderRef}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 shadow-sm">
                    <LoaderIcon className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      Loading more reviews...
                    </span>
                  </div>
                ) : (
                  <div className="h-16"></div>
                )}
              </div>
            )}

            {!hasMore && reviews.length > 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                You've reached the end of recent activity.
              </p>
            )}

            {reviews.length === 0 && (
              <div className="flex h-60 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-primary/5 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <LoaderIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">No reviews yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be the first to review an album!
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
