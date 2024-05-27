import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Card, CardContent, CardImage } from "~/components/common/ui/card";
import { getNewAlbums } from "~/services/client-api";
import { getSpotifyToken } from "~/services/spotify.server";
import { Album } from "~/util/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const tokenData = await getSpotifyToken();

  return json({ tokenData });
};

export default function DiscoverPage() {
  const [newAlbums, setNewAlbums] = useState<Album[]>([]);
  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    const fetchNewAlbums = async () => {
      try {
        const newAlbums = await getNewAlbums(loaderData.tokenData.access_token);
        setNewAlbums(newAlbums);
      } catch (error) {
        console.error("Failed to fetch new albums", error);
      }
    };

    fetchNewAlbums();
  }, [loaderData.tokenData.access_token]);

  return (
    <main className="space-y-8 py-8 text-center md:container md:py-16 lg:space-y-12">
      <h1 className="text-3xl font-semibold">Discover</h1>
      <h2 className="text-xl">New releases</h2>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {newAlbums.map((album) => (
          <Link to={`/`} key={album.id}>
            <Card className="shadow-md transition-transform hover:scale-105">
              <CardImage src={album.image} alt={album.name} />
              <CardContent>
                <h3 className="mb-1 h-14 overflow-hidden text-start text-lg font-semibold hover:underline">
                  {album.name}
                </h3>
                <div className="mb-1 flex">
                  <p className="font-semibold text-gray-500 dark:text-gray-300">
                    {album.artists.map((artist, index) => {
                      if (index < album.artists.length - 1) {
                        return <span key={artist.id}>{artist.name} + </span>;
                      }
                      return <span>{artist.name}</span>;
                    })}
                  </p>
                </div>
                <p className="flex justify-start text-sm">
                  {format(new Date(album.releaseDate), "d MMM yyyy")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
