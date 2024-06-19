import { LoaderFunctionArgs, json } from "@vercel/remix";
import { Link, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { Card, CardContent, CardImage } from "~/components/common/ui/card";
import {
  getSpotifyToken,
  getAlbumsFromPlaylist,
} from "~/services/music-services/spotify.server";
import { parseVercelId } from "~/util/utils";

export const config = { runtime: "edge" };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const tokenData = await getSpotifyToken();
  const eggs = await getAlbumsFromPlaylist();
  const parsedVercelId = parseVercelId(request.headers.get("x-vercel-id"));

  return json({ newAlbums: eggs, parsedVercelId });
};

export default function DiscoverPage() {
  const { newAlbums, parsedVercelId } = useLoaderData<typeof loader>();

  return (
    <main className="space-y-8 px-4 py-8 text-center md:container md:py-16 lg:space-y-12">
      <h1 className="text-3xl font-semibold">Discover</h1>
      <h2 className="text-xl">New releases</h2>
      <h3>
        Proxy region: {parsedVercelId.proxyRegion}. Compute region:{" "}
        {parsedVercelId.computeRegion}
      </h3>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {newAlbums.map((album) => (
          <Link to={`/album/${album.id}`} key={album.id}>
            <Card className="shadow-md transition-transform hover:scale-105">
              <CardImage src={album.image} alt={album.name} />
              <CardContent>
                <h3 className="mb-1 h-14 overflow-hidden text-start text-lg font-semibold hover:underline">
                  {album.name}
                </h3>
                <div className="mb-1 flex">
                  <p className="font-semibold text-gray-500 dark:text-gray-300">
                    <span key={album.artists[0].id}>
                      {album.artists[0].name}
                    </span>
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
