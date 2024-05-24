import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { desc, lt } from "drizzle-orm";
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
import { db } from "~/drizzle/db.server";
import { albums } from "~/drizzle/schema.server";
import { getArchiveAlbums } from "~/services/album";

export const loader = async () => {
  const archivedAlbums = await getArchiveAlbums();

  return json(archivedAlbums);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const sort = formData.get("sort");

  const archivedAlbums = await getArchiveAlbums();

  if (sort === "listenDate") {
    return json(archivedAlbums);
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

  const sortAlbums = async (value: string) => {
    const formData = new FormData();
    formData.append("sort", value);
    fetcher.submit(formData, {
      method: "POST",
    });
  };

  return (
    <main className="space-y-8 py-8 text-center md:container md:py-16 lg:space-y-12">
      <h1 className="text-3xl font-semibold">Daily Disc archive</h1>
      <div className="px-4 md:container md:px-6">
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
      </div>
      <h2 className="text-xl">2024</h2>
      <section className="grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        {archivedAlbums.map((album) => (
          <AlbumPreviewCard album={album} key={album.id} />
        ))}
      </section>
    </main>
  );
}
