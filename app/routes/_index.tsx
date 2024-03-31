import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { PlayCircle, StarIcon } from "lucide-react";
import { Badge } from "~/components/common/ui/badge";
import { Button } from "~/components/common/ui/button";
import { Label } from "~/components/common/ui/label";
import { Textarea } from "~/components/common/ui/textarea";
import { db } from "~/drizzle/db.server";
import { albums, artists, artistsToAlbums } from "~/drizzle/schema.server";

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
    const { genre, title, image } = albumOfTheDay;
    return json({ genre, image, title, artists });
  }

  return json(null);
};

export const action = async () => {
  const rollingStones = await db.query.artists.findFirst({
    where: eq(artists.name, "The Rolling Stones"),
  });

  if (rollingStones) {
    const [newAlbum] = await db
      .insert(albums)
      .values({
        title: "Exile on Main Street",
        genre: "Rock",
        image:
          "https://therollingstonesshop.co.uk/cdn/shop/products/SharedImage-22302_2.jpg?v=1693855216",
      })
      .returning({ id: albums.id });

    await db.insert(artistsToAlbums).values([
      {
        artistId: rollingStones.id,
        albumId: newAlbum.id,
      },
    ]);
  }

  return json({ message: "Album created" });
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  if (!loaderData) return <p>Album today is borked</p>;

  console.log("loaderData", loaderData);
  const { artists, genre, image, title } = loaderData;
  return (
    <div>
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
            className="group relative mx-auto block h-[300px] w-[300px] cursor-pointer overflow-hidden rounded-lg border-4 border-primary bg-accent"
            target="_blank"
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
            <div className="absolute inset-0 flex items-center justify-center transition-all group-hover:bg-black group-hover:opacity-60">
              <PlayCircle
                strokeWidth={1}
                className="hidden h-full w-full group-hover:block"
              />
            </div>
          </Link>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter">{title}</h2>
            {artists.map((artist) => (
              <p key={artist.id} className="text-sm font-medium leading-none">
                {artist.name}
              </p>
            ))}
            <Badge>{genre}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 fill-primary" />
                <StarIcon className="h-4 w-4 fill-primary" />
                <StarIcon className="h-4 w-4 fill-primary" />
                <StarIcon className="h-4 w-4 fill-muted" />
                <StarIcon className="h-4 w-4 fill-muted" />
              </div>
            </div>
          </div>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="review">
                Your Review
              </Label>
              <Textarea
                className="min-h-[100px] resize-none bg-accent text-sm"
                id="review"
                placeholder="What did you think of the album?"
              />
            </div>
            <Button className="w-full" type="submit">
              Submit Review
            </Button>
          </Form>
        </div>
      </section>
    </div>
  );
}
