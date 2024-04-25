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

const ReviewFormSchema = z.object({
  albumId: z.string(),
  rating: z.number().int().min(1).max(10),
  favouriteTrack: z.string().min(1),
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
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setUTCHours(0, 0, 0, 0); // This is hideous. Find better way

  const albumOfTheDay = await db.query.albums.findFirst({
    where: eq(albums.listenDate, date),
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

    const artists = albumOfTheDay.artistsToAlbums.map((data) => data.artist);
    return json({
      archiveDate: date.toISOString(),
      album: albumOfTheDay,
      artists,
      albumReviews,
      hasUserReviewed,
    });
  }

  return json(null);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "change-date") {
    console.log("date", formData.get("date"));
  }
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

  const { albumId, favouriteTrack, rating, review, userId } = submission.value;

  await db.insert(reviews).values({
    albumId: Number(albumId),
    userId: Number(userId),
    rating: Math.floor(rating * 2),
    review,
    favouriteTrack,
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

  if (!loaderData) return <p>Random album selection failed</p>;

  const handleDateChange = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    navigate(`/?date=${formattedDate}`);
  };

  const { album, albumReviews, archiveDate, artists, hasUserReviewed } =
    loaderData;
  const { id, title, image, genre, year } = album;

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
                <FormField
                  label="Favourite track"
                  placeholder="Enter your favourite track"
                  {...getInputProps(fields.favouriteTrack, { type: "text" })}
                />
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
      <section>
        <h3>Reviews</h3>
        {albumReviews.map((review) => (
          <div key={review.id} className="border border-gray-200 p-4">
            <h4>{review.user.username}</h4>
            <p>Rating: {review.rating / 2}/10</p>
            <p>Favourite track: {review.favouriteTrack}</p>
            {review.review && <p>{review.review}</p>}
          </div>
        ))}
      </section>
    </main>
  );
}
