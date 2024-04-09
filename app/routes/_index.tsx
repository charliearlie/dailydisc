import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { PlayCircle, StarIcon } from "lucide-react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { z } from "zod";

import { Badge } from "~/components/common/ui/badge";
import { Button } from "~/components/common/ui/button";
import { FormField } from "~/components/form/form-field";
import { FormFieldTextArea } from "~/components/form/form-field-text-area";
import { db } from "~/drizzle/db.server";
import { reviews } from "~/drizzle/schema.server";
import { useUser } from "~/contexts/user-context";

const ReviewFormSchema = z.object({
  albumId: z.string(),
  rating: z.number().int().min(1).max(10),
  favouriteTrack: z.string().min(1),
  review: z.string().optional(),
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

export const loader = async ({}: LoaderFunctionArgs) => {
  const albumOfTheDay = await db.query.albums.findFirst({
    with: {
      artistsToAlbums: {
        with: {
          artist: true,
        },
      },
    },
  });

  if (albumOfTheDay) {
    const artists = albumOfTheDay.artistsToAlbums.map((data) => data.artist);
    const { genre, id, image, title } = albumOfTheDay;
    return json({ genre, id, image, title, artists });
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

  const { albumId, favouriteTrack, rating, review } = submission.value;

  await db.insert(reviews).values({
    albumId: Number(albumId),
    userId: 1,
    rating,
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

  if (!loaderData) return <p>Album today is borked</p>;

  const { artists, genre, id, image, title } = loaderData;
  return (
    <main className="flex-1">
      <section className="container space-y-8 py-8 text-center md:py-16 lg:space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
            Album of the Day
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Explore today's featured album and share your thoughts.
          </p>
        </div>
        <div className="mx-auto max-w-sm space-y-4">
          <Link
            to="https://music.apple.com/us/album/exile-on-main-st-2010-remaster/1440872228?uo=4"
            className="group relative mx-auto block h-[300px] w-[300px] cursor-pointer overflow-hidden rounded-lg border-4 border-primary bg-accent duration-300 hover:-translate-y-1 hover:scale-110"
            target="_blank"
            aria-label="Listen to the album on Apple Music"
          >
            <img
              alt={`${title} album artwork`}
              height="300"
              src={image!}
              style={{
                aspectRatio: "300/300",
                objectFit: "cover",
              }}
              width="300"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-all ease-in-out group-hover:bg-black group-hover:opacity-60">
              <PlayCircle
                strokeWidth={1}
                className="hidden h-full w-full group-hover:block"
              />
            </div>
          </Link>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter">
              <Link
                aria-label={`View reviews for ${title}`}
                to={`/albums/${id}`}
              >
                {title}
              </Link>
            </h2>
            {artists.map((artist) => (
              <p key={artist.id} className="text-sm font-medium leading-none">
                {artist.name}
              </p>
            ))}
            <Badge>{genre}</Badge>
          </div>
          {isLoggedIn ? (
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
                <input hidden name="albumId" value={loaderData.id} />
              </div>
              <Button className="w-full" type="submit">
                Submit Review
              </Button>
            </Form>
          ) : (
            <Button asChild className="w-full">
              <Link to="/signup">Login to submit a review</Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
