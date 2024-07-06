import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { format } from "date-fns";

import { Badge } from "~/components/common/ui/badge";
import { Button } from "~/components/common/ui/button";
import { db } from "~/drizzle/db.server";
import { albums, reviews } from "~/drizzle/schema.server";
import { useUser } from "~/contexts/user-context";
import { eq } from "drizzle-orm";
import { getUserFromRequestContext } from "~/services/session";
import { DatePicker } from "~/components/common/date-picker";
import { ReviewList } from "~/components/reviews/review-list";
import { getAlbumDetails } from "~/services/itunes.api.server";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/common/ui/tabs";
import { AlbumPopover } from "~/components/album/album-popover";
import { asset, removeFeaturedArtists } from "~/util/utils";
import { ReviewFormSchema } from "~/components/reviews/types";
import { ReviewForm } from "~/components/reviews/review-form";
import { ErrorBoundaryComponent } from "~/components/error-boundary";
import { getAlbumInfo } from "~/services/music-services/spotify.server";
import { Avatar, AvatarImage } from "~/components/common/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Card, CardContent } from "~/components/common/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/ui/accordion";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: "Daily Disc" },
    {
      name: "description",
      content:
        "An online club to listen to a random album every day where you can join in the conversation",
    },
    {
      property: "og:image",
      content: data?.socialImage,
    },
    {
      charset: "utf-8",
      title: "Scrbbl: Scrobble album",
      viewport: "width=device-width,initial-scale=1",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const socialImage = asset("/DailyDisc.png", new URL(request.url));

  const user = await getUserFromRequestContext(request);
  const todaysDate = new Date();
  const albumDate = dateParam ? new Date(dateParam) : todaysDate;

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

      const tracks = await getAlbumDetails(
        Number(albumOfTheDay.appleMusicCollectionId),
      );

      const album = {
        ...albumOfTheDay,
        tracks,
        newRelease: !dateParam && albumOfTheDay.year === "2024" ? true : false,
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
        socialImage,
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

  if (!loaderData) return <p>Album has not been selected yet..</p>;

  const handleDateChange = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    navigate(`/?date=${formattedDate}`);
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
    <main className="to-gradientend flex-1 bg-gradient-to-tl from-background via-background">
      <section className="container  space-y-8 py-8 text-center md:py-16 lg:space-y-12">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
            Album of the Day
          </h1>
          <p className="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Explore today&apos;s featured album and share your thoughts.
          </p>
          <div className="mx-auto flex w-44">
            <DatePicker
              name="date"
              defaultDate={new Date(archiveDate)}
              onSelect={handleDateChange}
              range={{ start: new Date("2024-04-22"), end: new Date() }}
            />
          </div>
        </div>
        <div className="mx-auto max-w-sm space-y-4">
          <AlbumPopover
            image={image!}
            title={title}
            appleMusicId={appleMusicCollectionId!}
            appleMusicUrl={appleMusicUrl!}
          />
          <h2 className="text-3xl font-bold tracking-tight">
            <Link
              aria-label={`View reviews for ${title}`}
              to={`/album/${spotifyUrl}`}
            >
              {title}
            </Link>
          </h2>
          {extraInfo ? (
            <div className="flex justify-center gap-4">
              {extraInfo.artists.map((artist) => (
                <Link
                  to={`/artist/${artist.id}`}
                  className="flex flex-col items-center gap-2 hover:opacity-80"
                  key={artist.id}
                  aria-describedby="artist-name"
                >
                  <Avatar className="h-20 w-20 border border-primary bg-primary">
                    <AvatarImage src={artist.images?.[0].url} />
                    <AvatarFallback>{artist.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    id="artist-name"
                    className="text-lg font-semibold leading-none tracking-tighter"
                  >
                    {artist.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <>
              {artists.map((artist) => (
                <p
                  key={artist.id}
                  className="text-lg font-semibold leading-none tracking-tighter"
                >
                  {artist.name}
                </p>
              ))}
            </>
          )}

          <p className="text-sm font-semibold tracking-wider">{year}</p>
          <Badge className="text-base">{genre}</Badge>
        </div>
      </section>
      <section className="container max-w-screen-md space-y-8 lg:space-y-12">
        {isLoggedIn && !hasUserReviewed ? (
          <Card className="mx-auto max-w-lg ">
            <CardContent className="p-8">
              <h3 className="py-4 text-start text-2xl font-semibold">
                Review album
              </h3>
              <ReviewForm />
            </CardContent>
          </Card>
        ) : null}
        {!isLoggedIn && (
          <div className="flex justify-center">
            <Button asChild className="mx-auto">
              <Link to="/signup">Login to submit a review</Link>
            </Button>
          </div>
        )}
      </section>
      <section className="container max-w-screen-md space-y-8 py-8 md:py-16 lg:space-y-12">
        <Accordion type="single">
          <AccordionItem value="reviews-and-tracklist">
            <AccordionTrigger>Reviews & tracklist</AccordionTrigger>
            <AccordionContent>
              <Tabs
                defaultValue={hasUserReviewed ? "reviews" : "tracklist"}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger className="w-full" value="reviews">
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger className="w-full" value="tracklist">
                    Track list
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="reviews">
                  <ReviewList
                    hasUserReviewed={hasUserReviewed}
                    reviews={albumReviews}
                  />
                </TabsContent>
                <TabsContent value="tracklist">
                  <div className="flex flex-col space-y-4">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between space-y-4"
                      >
                        <div className="flex flex-col">
                          <p className="text-lg font-medium">{track.title}</p>
                          <p className="m-0 text-xs font-light">
                            {track.artist}
                          </p>
                        </div>
                        <p className="text-sm font-light">
                          {format(new Date(track.trackTimeMillis!), "mm:ss")}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
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
