import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  defer,
  json,
} from "@remix-run/node";
import { Await, useFetcher, useLoaderData } from "@remix-run/react";
import { LoaderIcon } from "lucide-react";
import { Suspense } from "react";
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
  const archiveAlbumPromise = getArchiveAlbums();

  return defer({ critical: "data", archivedAlbums: archiveAlbumPromise });
};

export default function ArchivePage() {
  const fetcher = useFetcher<typeof loader>();
  const loaderData = useLoaderData<typeof loader>();

  const { archivedAlbums } = loaderData;
  //   const userReviewedAlbumsCount = archivedAlbums.filter(
  //     (album) => album.usersRating !== null,
  //   ).length;

  const sortAlbums = async (value: string) => {
    const formData = new FormData();
    formData.append("sort", value);
    fetcher.submit(formData, {
      method: "POST",
    });
  };

  //   const ReviewedText = () => {
  //     if (userReviewedAlbumsCount < archivedAlbums.length) {
  //       return (
  //         <h3 className="text-lg">
  //           So far you have reviewed {userReviewedAlbumsCount} /{" "}
  //           {archivedAlbums.length} albums
  //         </h3>
  //       );
  //     }

  //     return (
  //       <h3 className="text-lg">
  //         ⭐️ You have reviewed all {archivedAlbums.length} albums selected so far
  //       </h3>
  //     );
  //   };

  return (
    <main className="flex-1">
      <section className="space-y-8 py-8 text-center md:container md:py-16">
        <h1 className="text-3xl font-semibold">Daily Disc archive</h1>
        <h2 className="mt-2 text-xl">
          Discover the albums that have already been picked for the Daily Disc
          album of the day.
        </h2>
        {/* <ReviewedText /> */}
      </section>
      <section className="space-y-8 py-8 text-center md:container md:py-16 lg:space-y-12">
        <div className="px-4 md:container md:px-6">
          {/* <Select onValueChange={sortAlbums}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sorting options</SelectLabel>
                <SelectItem value="listenDate">Most recent</SelectItem>
                <SelectItem value="userRating">My rating</SelectItem>
                <SelectItem value="averageRating">Rating</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> */}
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-4 xl:grid-cols-4">
          <Suspense fallback={<LoaderIcon className="animate-spin" />}>
            <Await resolve={archivedAlbums}>
              {(albums) =>
                albums.map((album) => <AlbumPreviewCard album={album} />)
              }
            </Await>
          </Suspense>
          s
        </div>
      </section>
    </main>
  );
}
