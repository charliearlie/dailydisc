import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { MessageCircle, Star } from "lucide-react";
import { Badge } from "~/components/common/ui/badge";
import { Card, CardImage } from "~/components/common/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/ui/tooltip";
import { getAllAlbums, getAllArtists } from "~/services/album.server";
import { getUserFromRequestContext } from "~/services/session";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromRequestContext(request);
  const archivedAlbums = await getAllAlbums(user?.id);
  const artistsWithoutAlbumInDb = await getAllArtists();

  return json({ archivedAlbums, artistsWithoutAlbumInDb, user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserFromRequestContext(request);

  const allAlbums = await getAllAlbums(user?.id);

  return json(allAlbums);
};

export default function AllAlbums() {
  const fetcher = useFetcher<typeof loader>();
  const loaderData = useLoaderData<typeof loader>();

  const { archivedAlbums, artistsWithoutAlbumInDb, user } =
    fetcher.data || loaderData;

  return (
    <main className="xl:max space-y-8 py-8 text-center md:container md:py-16 lg:space-y-12">
      <h1 className="text-3xl font-semibold">Daily Disc all albums</h1>
      <section className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-4 xl:grid-cols-4">
        {archivedAlbums.map((album) => (
          <Link key={album.id} to={`/album/${album.spotifyUrl}`}>
            <Card
              className={
                "shadow-md transition-transform hover:overflow-visible hover:bg-accent md:hover:scale-105"
              }
              key={album.id}
            >
              <div className="flex items-center justify-between border-b-2 border-accent bg-transparent p-4 font-semibold">
                {album.usersRating ? (
                  <Badge variant="secondary">
                    My rating: {album.usersRating}
                  </Badge>
                ) : user?.id ? (
                  <Badge variant="destructive">Unreviewed</Badge>
                ) : null}
              </div>
              <CardImage src={album.image!} alt="Album Cover" />
              <div className="relative p-4">
                <h3 className="mb-1 h-14 overflow-hidden text-start text-lg font-semibold hover:underline">
                  {album.title}
                </h3>
                <div className="mb-2 flex items-center justify-between pt-2">
                  <div className="font-semibold text-gray-500 dark:text-gray-300">
                    <Artists
                      artists={album.artistsToAlbums.map(
                        (link) => link.artist.name,
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="font-semibold text-gray-500 dark:text-gray-300">
                          {album.year}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Album release year</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="flex items-center gap-2">
                    <p className="flex items-center gap-1 text-sm">
                      <MessageCircle height={16} width={16} />
                      {album.reviews.length}
                    </p>
                    <p className="flex items-center gap-1 text-sm">
                      <Star height={16} width={16} />
                      {album.usersRating ? album.averageRating : ""}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>
      {JSON.stringify(artistsWithoutAlbumInDb)}
    </main>
  );
}

const Artists = ({ artists }: { artists: string[] }) => {
  return (
    <p>
      {artists.map((artist, index) => {
        return (
          <span key={artist}>
            {artist}
            {`${index === artists.length - 1 ? "" : ", "}`}
          </span>
        );
      })}
    </p>
  );
};
