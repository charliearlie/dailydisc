import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
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
  return {
    title: "Daily Disc archive",
    description: "Browse all albums selected on Daily Disc so far",
  };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromRequestContext(request);
  const archivedAlbums = await getArchiveAlbums(user?.id);

  return json(archivedAlbums);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserFromRequestContext(request);
  const formData = await request.formData();
  const sort = formData.get("sort");

  const archivedAlbums = await getArchiveAlbums(user?.id);

  if (sort === "listenDate") {
    return json(archivedAlbums);
  }

  if (sort === "userRating") {
    return json(
      archivedAlbums.sort((a, b) => {
        const ratingA = a.usersRating ?? -1;
        const ratingB = b.usersRating ?? -1;

        return ratingB - ratingA;
      }),
    );
  }

  return json(
    archivedAlbums.sort((a, b) => {
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
        <h2 className="text-xl">
          So far you have reviewed {userReviewedAlbumsCount} /{" "}
          {archivedAlbums.length} albums
        </h2>
      );
    }

    return (
      <h2 className="text-xl">
        ⭐️ You have reviewed all {archivedAlbums.length} albums selected so far
      </h2>
    );
  };

  return (
    <main className="flex-1">
      <section className="space-y-8 py-8 text-center md:container md:py-16 lg:space-y-12">
        <h1 className="text-3xl font-semibold">Daily Disc archive</h1>
        <ReviewedText />
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
