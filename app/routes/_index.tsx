import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { PlayCircle } from "lucide-react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Badge } from "~/components/common/ui/badge";
import { Button } from "~/components/common/ui/button";
import { FormField } from "~/components/form/form-field";
import { FormFieldTextArea } from "~/components/form/form-field-text-area";
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
import { Label } from "~/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/ui/select";

const ReviewFormSchema = z.object({
  albumId: z.string(),
  rating: z.number().multipleOf(0.5).min(1).max(10),
  favouriteTracks: z.array(z.string()),
  review: z.string().optional(),
  userId: z.string(),
});

export const meta: MetaFunction = () => {
  return [
    { title: "Daily Disc" },
    {
      name: "description",
      content:
        "An online club to listen to a random album every day where you can join in the conversation",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const user = await getUserFromRequestContext(request);
  const todaysDate = new Date();
  const albumDate = dateParam ? new Date(dateParam) : todaysDate;

  if (albumDate <= todaysDate) {
    albumDate.setUTCHours(0, 0, 0, 0); // This is hideous. Find better way

    const albumOfTheDay = await db.query.albums.findFirst({
      where: eq(albums.listenDate, albumDate),
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

      const hasUserReviewed = albumReviews.some(
        (album) => album.userId === user?.id,
      );

      const tracks = await getAlbumDetails(
        Number(albumOfTheDay.appleMusicCollectionId),
      );

      const artists = albumOfTheDay.artistsToAlbums.map((data) => data.artist);
      return json({
        archiveDate: albumDate.toISOString(),
        album: { ...albumOfTheDay, tracks },
        artists,
        albumReviews,
        hasUserReviewed,
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

  console.log("favouriteTracks", favouriteTracks);

  await db.insert(reviews).values({
    albumId: Number(albumId),
    userId: Number(userId),
    rating: Math.floor(rating * 2),
    review,
    favouriteTrack: favouriteTracks.map((track) => track.trim()).join(" | "),
  });

  return json({
    result: submission.reply({ resetForm: true }),
    status: "success" as const,
  });
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  const user = useUser();
  const isLoggedIn = Boolean(user?.username);

  const [form, fields] = useForm({
    id: "review-form",
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(ReviewFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ReviewFormSchema });
    },
  });

  if (!loaderData) return <p>Album has not been selected yet..</p>;

  const handleDateChange = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    navigate(`/?date=${formattedDate}`);
  };

  const { album, albumReviews, archiveDate, artists, hasUserReviewed } =
    loaderData;
  const { id, title, image, genre, tracks, year } = album;

  const favouriteTracks = fields.favouriteTracks.getFieldList();

  return (
    <main className="flex-1">
      <section className="container space-y-8 py-8 text-center md:py-16 lg:space-y-12">
        <div className="flex flex-col justify-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
            Album of the Day
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
          <Link
            to="https://music.apple.com/us/album/exile-on-main-st-2010-remaster/1440872228?uo=4"
            className="group relative mx-auto block h-[250px] w-[250px] cursor-pointer overflow-hidden rounded-lg border-4 border-primary bg-accent duration-300 hover:-translate-y-1 hover:scale-110"
            target="_blank"
            aria-label="Listen to the album on Apple Music"
            rel="noopener noreferrer"
          >
            <img
              alt={`${title} album artwork`}
              height="250"
              src={image!}
              style={{
                aspectRatio: "250/250",
                objectFit: "cover",
              }}
              width="250"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-all ease-in-out group-hover:bg-black group-hover:opacity-60">
              <PlayCircle
                strokeWidth={1}
                className="hidden h-full w-full group-hover:block"
              />
            </div>
          </Link>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              <Link
                aria-label={`View reviews for ${title}`}
                to={`/albums/${id}`}
              >
                {title}
              </Link>
            </h2>
            {artists.map((artist) => (
              <p
                key={artist.id}
                className="text-lg font-medium leading-none tracking-tighter"
              >
                {artist.name}
              </p>
            ))}
            <p className="text-sm tracking-wider">{year}</p>
            <Badge>{genre}</Badge>
          </div>
          {isLoggedIn && !hasUserReviewed ? (
            <Form method="post" className="space-y-4" {...getFormProps(form)}>
              <div className="space-y-2">
                <FormField
                  className="m-auto w-20"
                  label="Rating"
                  placeholder="1-10"
                  {...getInputProps(fields.rating, { type: "number" })}
                />
                <div className="mb-8 flex w-full flex-col gap-1.5">
                  <Label className="font-bold" htmlFor="category">
                    Favourite tracks
                  </Label>
                  {favouriteTracks.map((favTrack) => (
                    <Select key={favTrack.id} name={favTrack.name}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select track" />
                      </SelectTrigger>
                      <SelectContent className="h-48">
                        {tracks.map((track) => {
                          if (track.title) {
                            return (
                              <SelectItem
                                className="cursor-pointer"
                                key={track.id}
                                value={track.title}
                              >
                                {track.title}
                              </SelectItem>
                            );
                          }
                        })}
                      </SelectContent>
                    </Select>
                  ))}
                  <div className="flex justify-center pb-8 pt-4">
                    <Button
                      className="w-full"
                      variant="outline"
                      {...form.insert.getButtonProps({
                        name: fields.favouriteTracks.name,
                      })}
                    >
                      {favouriteTracks.length === 0
                        ? "Add track"
                        : "Add another track"}
                    </Button>
                  </div>
                </div>
                <FormFieldTextArea
                  className="min-h-[100px] resize-none"
                  label="Your Review (optional)"
                  placeholder="What did you think of the album?"
                  {...getInputProps(fields.review, { type: "text" })}
                />
                <input hidden name="albumId" value={loaderData.album.id} />
                <input hidden name="userId" value={user.userId} />
              </div>
              <Button
                className="w-full"
                disabled={actionData?.status === "success"}
                type="submit"
              >
                {actionData?.status === "success"
                  ? "Review submitted"
                  : "Submit Review"}
              </Button>
            </Form>
          ) : null}
          {!isLoggedIn && (
            <Button asChild className="w-full">
              <Link to="/signup">Login to submit a review</Link>
            </Button>
          )}
        </div>
      </section>
      <section className="container max-w-screen-md space-y-8 py-8 md:py-16 lg:space-y-12">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="account">
              Reviews
            </TabsTrigger>
            <TabsTrigger className="w-full" value="password">
              Track list
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <ReviewList reviews={albumReviews} />
          </TabsContent>
          <TabsContent value="password">
            <div className="flex flex-col space-y-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between space-y-4"
                >
                  <div className="flex flex-col">
                    <p className="text-lg font-medium">{track.title}</p>
                    <p className="m-0 text-xs font-light">{track.artist}</p>
                  </div>
                  <p className="text-sm font-light">
                    {format(new Date(track.trackTimeMillis!), "mm:ss")}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
