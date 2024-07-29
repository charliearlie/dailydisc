import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
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
import { getArchiveAlbums } from "~/services/album.server";
import { getUserFromRequestContext } from "~/services/session";

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
  const user = await getUserFromRequestContext(request);
  const archivedAlbums = await getArchiveAlbums(user?.id);

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

  return json(albumsWithAverageRating);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserFromRequestContext(request);
  const formData = await request.formData();
  const sort = formData.get("sort");

  const archivedAlbums = await getArchiveAlbums(user?.id);

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

  if (sort === "listenDate") {
    return json(albumsWithAverageRating);
  }

  if (sort === "userRating") {
    return json(
      albumsWithAverageRating.sort((a, b) => {
        const ratingA = a.usersRating ?? -1;
        const ratingB = b.usersRating ?? -1;

        return ratingB - ratingA;
      }),
    );
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
  const userReviewedAlbumsCount = archivedAlbums.filter(
    (album) => album.usersRating !== null,
  ).length;

  const sortAlbums = async (value: string) => {
    const formData = new FormData();
    formData.append("sort", value);
    fetcher.submit(formData, {
      method: "POST",
    });
  };

  const ReviewedText = () => {
    if (userReviewedAlbumsCount < archivedAlbums.length) {
      return (
        <h3 className="text-lg">
          So far you have reviewed {userReviewedAlbumsCount} /{" "}
          {archivedAlbums.length} albums
        </h3>
      );
    }

    return (
      <h3 className="text-lg">
        ⭐️ You have reviewed all {archivedAlbums.length} albums selected so far
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
        <div className="px-4 md:container md:px-6">
          <Select onValueChange={sortAlbums}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sorting options</SelectLabel>
                <SelectItem value="listenDate">Most recent</SelectItem>
                <SelectItem value="userRating">My rating</SelectItem>
                <SelectItem value="accumulativeRating">Rating</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-4 xl:grid-cols-4">
          {archivedAlbums.map((album) => (
            <AlbumPreviewCard album={album} key={album.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
