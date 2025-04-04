import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { format } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { AvatarFallback } from "@radix-ui/react-avatar";

import { Badge } from "~/components/common/ui/badge";
import { Button } from "~/components/common/ui/button";
import { db } from "~/drizzle/db.server";
import { albums, reviews } from "~/drizzle/schema.server";
import { useUser } from "~/contexts/user-context";
import { getUserFromRequestContext } from "~/services/session";
import { DatePicker } from "~/components/common/date-picker";
import { ReviewList } from "~/components/reviews/review-list";
import { getAlbumTracks } from "~/services/itunes.api.server";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/common/ui/tabs";
import { AlbumPopover } from "~/components/album/album-popover";
import { invariantResponse, removeFeaturedArtists } from "~/util/utils";
import { ReviewFormSchema } from "~/components/reviews/types";
import { ReviewForm } from "~/components/reviews/review-form";
import { ErrorBoundaryComponent } from "~/components/error-boundary";
import { getAlbumInfo } from "~/services/music-services/spotify.server";
import { Avatar, AvatarImage } from "~/components/common/ui/avatar";
import { Card, CardContent } from "~/components/common/ui/card";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Daily Disc Archive | ${data?.artists[0]?.name} - ${data?.album.title}`,
    },
    {
      name: "description",
      content:
        "An online club to listen to a random album every day where you can join in the conversation",
    },
    {
      property: "og:image",
      content: data?.album?.image,
    },
    {
      charset: "utf-8",
      viewport: "width=device-width,initial-scale=1",
    },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariantResponse(params.albumDate, "Expected params.albumDate");

  const user = await getUserFromRequestContext(request);
  const todaysDate = new Date();
  const albumDate = new Date(params.albumDate);

  if (albumDate <= todaysDate) {
    albumDate.setUTCHours(0, 0, 0, 0);

    const albumOfTheDay = await db.query.albums.findFirst({
      where:
        albumDate == todaysDate
          ? eq(albums.active, 1)
          : eq(albums.listenDate, albumDate),
      with: {
        artistsToAlbums: {
          with: {
            artist: true,
          },
        },
      },
    });

    if (albumOfTheDay) {
      const albumReviews = await db.query.reviews.findMany({
        where: eq(reviews.albumId, albumOfTheDay.id),
        with: {
          user: true,
        },
      });

      const userReview = albumReviews.find(
        (album) => album.userId === user?.id,
      );

      const hasUserReviewed = !!userReview;

      const tracks = await getAlbumTracks(
        Number(albumOfTheDay.appleMusicCollectionId),
      );

      const album = {
        ...albumOfTheDay,
        tracks,
      };

      const artists = albumOfTheDay.artistsToAlbums.map((data) => data.artist);
      return json({
        archiveDate: albumDate.toISOString(),
        album,
        artists,
        albumReviews,
        hasUserReviewed,
        userReview,
        extraInfo: album.spotifyUrl
          ? await getAlbumInfo(album.spotifyUrl)
          : null,
      });
    }
  }

  return json(null);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: ReviewFormSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), status: submission.status } as const,
      {
        status: submission.status === "error" ? 400 : 200,
      },
    );
  }

  // This is ludicrous destructuring
  const [result] = await db
    .select({
      reviewCount: sql<number>`count(*)`.as("reviewCount"),
      averageRating: sql<number | null>`
      CASE 
        WHEN count(*) > 0 THEN round(avg(${reviews.rating}), 2)
        ELSE NULL
      END
    `.as("averageRating"),
    })
    .from(reviews)
    .where(eq(reviews.albumId, Number(submission.value.albumId)));

  const { reviewCount, averageRating } = result;

  let newAverageRating;

  if (!averageRating) {
    newAverageRating = Math.floor(submission.value.rating * 2);
  } else {
    newAverageRating =
      Math.floor(averageRating * reviewCount + submission.value.rating * 2) /
      (reviewCount + 1);
  }

  const { albumId, favouriteTracks, rating, review, userId } = submission.value;

  await db.insert(reviews).values({
    albumId: Number(albumId),
    userId: Number(userId),
    rating: Math.floor(rating * 2),
    review,
    favouriteTrack: favouriteTracks
      .map((track) => removeFeaturedArtists(track))
      .join(" | "),
  });

  const updatedAverageRating: { updatedRating: number | null }[] = await db
    .update(albums)
    .set({ averageRating: newAverageRating / 2 })
    .where(eq(albums.id, Number(albumId)))
    .returning({ updatedRating: albums.averageRating });

  return json({
    result: submission.reply({ resetForm: true }),
    status: "success" as const,
  });
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const user = useUser();
  const isLoggedIn = Boolean(user?.username);

  if (!loaderData) return <p>Album for this date has not been selected yet</p>;

  const handleDateChange = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    // Check if this is today's date - if so, go to the main route
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() === today.getTime()) {
      navigate("/");
    } else {
      navigate(`/archive/${formattedDate}`);
    }
  };

  const {
    album,
    albumReviews,
    archiveDate,
    artists,
    extraInfo,
    hasUserReviewed,
  } = loaderData;
  const {
    appleMusicCollectionId,
    appleMusicUrl,
    title,
    image,
    genre,
    spotifyUrl,
    tracks,
    year,
  } = album;

  return (
    <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/15">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Album of the <span className="text-primary">Day</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore today's featured album and share your thoughts.
          </p>
          <div className="mx-auto mt-6 flex w-auto items-center justify-center gap-3">
            <div className="w-[120px] text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevDay = new Date(archiveDate);
                  prevDay.setDate(prevDay.getDate() - 1);
                  handleDateChange(prevDay);
                }}
                className="flex items-center gap-1"
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
                  className="lucide lucide-chevron-left"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Previous
              </Button>
            </div>
            <div className="w-auto min-w-[200px] text-center">
              {/* Use key to force re-render when date changes */}
              <div className="inline-block">
                <DatePicker
                  key={archiveDate}
                  name="date"
                  defaultDate={new Date(archiveDate)}
                  onSelect={handleDateChange}
                  range={{ start: new Date("2024-04-22"), end: new Date() }}
                />
              </div>
            </div>
            <div className="w-[120px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextDay = new Date(archiveDate);
                  nextDay.setDate(nextDay.getDate() + 1);

                  // Check if next day is future date
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const nextDayDate = new Date(nextDay);
                  nextDayDate.setHours(0, 0, 0, 0);

                  if (nextDayDate > today) {
                    // Don't navigate to future dates
                    return;
                  }

                  // Navigate to the correct route
                  handleDateChange(nextDay);
                }}
                disabled={
                  new Date(archiveDate).toDateString() ===
                  new Date().toDateString()
                }
                className="flex items-center gap-1"
              >
                Next
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
                  className="lucide lucide-chevron-right"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Album Section */}
        <div className="mb-16 grid items-center gap-8 md:mx-auto md:max-w-3xl lg:grid-cols-5">
          {/* Album Cover */}
          <div className="relative flex justify-center lg:col-span-2">
            <div className="group relative max-w-[400px]">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary via-primary/50 to-primary/20 opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
              <div className="relative">
                <AlbumPopover
                  image={image!}
                  title={title}
                  appleMusicId={appleMusicCollectionId!}
                  appleMusicUrl={appleMusicUrl!}
                />
              </div>
            </div>
          </div>

          {/* Album Info */}
          <div className="flex flex-col space-y-6 p-4 lg:col-span-3">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <Link
                  aria-label={`View reviews for ${title}`}
                  to={`/album/${spotifyUrl}`}
                  className="hover:text-primary/90"
                >
                  {title}
                </Link>
              </h2>

              <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                {extraInfo
                  ? extraInfo.artists.map((artist) => (
                      <Link
                        to={`/artist/${artist.id}`}
                        className="flex items-center gap-3 rounded-full bg-card py-2 hover:bg-card/80"
                        key={artist.id}
                      >
                        <Avatar className="h-8 w-8 border border-primary">
                          <AvatarImage src={artist.images?.[0]?.url} />
                          <AvatarFallback>{artist.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{artist.name}</span>
                      </Link>
                    ))
                  : artists.map((artist) => (
                      <span
                        key={artist.id}
                        className="rounded-full bg-card py-2 font-medium"
                      >
                        {artist.name}
                      </span>
                    ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Badge variant="outline" className="text-sm">
                {year}
              </Badge>
              <Badge className="bg-primary/20 text-primary-foreground">
                {genre}
              </Badge>
            </div>
          </div>
        </div>

        {/* Review Form Section */}
        {isLoggedIn && !hasUserReviewed ? (
          <div className="mb-16 md:mx-auto md:max-w-3xl">
            <Card className="mx-auto max-w-xl overflow-visible shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mb-6 text-center text-2xl font-semibold sm:text-left">
                  Review this album
                </h3>
                <ReviewForm />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {!isLoggedIn && (
          <div className="mb-16 flex justify-center md:mx-auto md:max-w-3xl">
            <Button
              asChild
              className="mx-auto bg-primary font-medium hover:bg-primary/90"
            >
              <Link to="/signup">Login to submit a review</Link>
            </Button>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs
          defaultValue={hasUserReviewed ? "reviews" : "tracklist"}
          className="mb-16 w-full md:mx-auto md:max-w-3xl"
        >
          <TabsList className="mb-6 w-full">
            <TabsTrigger className="w-full text-base" value="reviews">
              Reviews
            </TabsTrigger>
            <TabsTrigger className="w-full text-base" value="tracklist">
              Track list
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="min-h-[300px]">
            <ReviewList
              hasUserReviewed={hasUserReviewed}
              reviews={albumReviews}
            />
          </TabsContent>

          <TabsContent value="tracklist">
            <div className="grid gap-3 sm:grid-cols-2">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 p-3 transition-colors hover:bg-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {track.trackNumber}
                    </span>
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(track.trackTimeMillis!), "mm:ss")}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <ErrorBoundaryComponent
      statusHandlers={{
        404: () => (
          <div className="p-4">
            <h2 className="text-3xl font-semibold">This page does not exist</h2>
            <Link to="/">Go back home</Link>
          </div>
        ),
        500: () => (
          <div className="p-4">
            <h2 className="text-3xl font-semibold">
              Something went wrong on our end
            </h2>
            <Link to="/">Go back home</Link>
          </div>
        ),
      }}
    />
  );
}
