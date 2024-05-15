import { ActionFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { asc, lt } from "drizzle-orm";
import { MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { Card, CardImage } from "~/components/common/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/common/ui/select";
import { db } from "~/drizzle/db.server";
import { albums } from "~/drizzle/schema.server";

export const loader = async () => {
  const archivedAlbums = await db.query.albums.findMany({
    where: lt(albums.listenDate, new Date()),
    with: {
      reviews: true,
      artistsToAlbums: {
        with: {
          artist: true,
        },
      },
    },
    orderBy: [asc(albums.listenDate)],
  });

  const albumsWithAverageRating = archivedAlbums.map((album) => {
    const totalRating = album.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );

    const averageRating = totalRating / album.reviews.length / 2;

    return {
      ...album,
      averageRating: isNaN(averageRating) ? "" : averageRating.toFixed(1),
    };
  });

  return json(albumsWithAverageRating);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const sort = formData.get("sort");

  const archivedAlbums = await db.query.albums.findMany({
    where: lt(albums.listenDate, new Date()),
    with: {
      reviews: true,
      artistsToAlbums: {
        with: {
          artist: true,
        },
      },
    },
    orderBy: [asc(albums.listenDate)],
  });

  const albumsWithAverageRating = archivedAlbums.map((album) => {
    const totalRating = album.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );

    const averageRating = totalRating / album.reviews.length / 2;

    return {
      ...album,
      averageRating: isNaN(averageRating) ? "" : averageRating.toFixed(1),
    };
  });

  if (sort === "listenDate") {
    return json(albumsWithAverageRating);
  }

  return json(
    albumsWithAverageRating.sort((a, b) => {
      if (a.averageRating === "" && b.averageRating === "") {
        return 0;
      }

      if (a.averageRating === "") {
        return 1;
      }

      if (b.averageRating === "") {
        return -1;
      }

      return Number(b.averageRating) - Number(a.averageRating);
    }),
  );
};

export default function ArchivePage() {
  const fetcher = useFetcher<typeof loader>();
  const loaderData = useLoaderData<typeof loader>();

  const archivedAlbums = fetcher.data || loaderData;

  const sortAlbums = async (value: string) => {
    const formData = new FormData();
    formData.append("sort", value);
    fetcher.submit(formData, {
      method: "POST",
    });
  };

  return (
    <main className="container space-y-8 py-8 text-center md:py-16 lg:space-y-12">
      <h1 className="text-3xl font-semibold">Daily Disc archive</h1>
      <Select onValueChange={sortAlbums}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by most recent" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sorting options</SelectLabel>
            <SelectItem value="listenDate">Most recent</SelectItem>
            <SelectItem value="banana">Rating</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <section className="grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-3 md:px-6 lg:grid-cols-4 ">
        {archivedAlbums.map((album) => (
          <Card className="shadow-md" key={album.id}>
            <CardImage
              to={`/?date=${format(album.listenDate!, "yyyy-MM-dd")}`}
              src={album.image!}
              alt="Album Cover"
            />
            <div className="relative p-4">
              <h3 className="mb-1 h-16 text-start text-lg font-semibold">
                <Link className="hover:underline" to="#">
                  {album.title}
                </Link>
              </h3>
              <div className="flex items-center justify-between">
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  {album.genre}
                </p>
                <div className="flex items-center gap-2">
                  <p className="flex items-center gap-1 text-sm">
                    <MessageCircle height={16} width={16} />
                    {album.reviews.length}
                  </p>
                  <p className="flex items-center gap-1 text-sm">
                    <Star height={16} width={16} />
                    {album.averageRating || ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {album.year}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(album.listenDate!).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
