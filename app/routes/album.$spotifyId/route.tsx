import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Badge } from "~/components/common/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "~/components/common/ui/avatar";
import { Button } from "~/components/common/ui/button";
import {
  getAlbumInfo,
  getAlbumsByArtist,
} from "~/services/music-services/spotify.server";
import { invariantResponse } from "~/util/utils";
import { format } from "date-fns";
import { ScrollableRow } from "~/components/common/ui/scrollable-row";
import { Card, CardImage } from "~/components/common/ui/card";
import { PlayCircle } from "lucide-react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariantResponse(params.spotifyId, "Expected params.spotifyId");
  const album = await getAlbumInfo(params.spotifyId);
  const relatedAlbums = await getAlbumsByArtist({
    artistId: album.artists[0]?.id,
    exclude: album.id,
  });

  return json({ album, relatedAlbums });
};

export default function AddArtistRoute() {
  const { album, relatedAlbums } = useLoaderData<typeof loader>();

  console.log("album.externalUrls", album.external_urls.spotify);

  return (
    <main className="relative flex flex-col">
      <section className="bg-background py-12 md:py-20 lg:py-24">
        <div className="container mx-auto grid items-center gap-8 px-4 md:grid-cols-2 md:px-6">
          <div>
            <img
              src={album.images?.[0].url}
              alt="Album Cover"
              width={500}
              height={500}
              className="mx-auto w-full max-w-[400px] rounded-lg shadow-lg shadow-accent"
            />
          </div>
          <div className="flex flex-col space-y-4 sm:block">
            <h1 className="self-center text-3xl font-bold text-primary md:text-4xl">
              {album.name}
            </h1>
            <div className="flex items-center gap-2 self-center">
              <Badge
                variant="secondary"
                className="bg-accent text-lg text-accent-foreground"
              >
                {format(album.releaseDate, "yyyy")}
              </Badge>
              <Button
                asChild
                className="hidden items-center justify-center bg-[#1DB954] hover:bg-[#1DB954] hover:opacity-70 sm:flex"
              >
                <a
                  href={album.external_urls.spotify}
                  rel="noreferrer"
                  target="_blank"
                >
                  View on Spotify
                </a>
              </Button>
            </div>
            <div className="flex justify-center gap-4 sm:items-center sm:justify-start">
              {album.artists.map((artist) => (
                <a
                  href={`/artist/${artist.id}`}
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 hover:opacity-80"
                  key={artist.id}
                >
                  <Avatar className="h-24 w-24 border border-primary bg-primary">
                    <AvatarImage src={artist.images?.[0].url} />
                    <AvatarFallback>{artist.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-orange-500">
                    {artist.name}
                  </span>
                </a>
              ))}
            </div>
            <p>
              This album takes you on a sonic journey through diverse landscapes
              of sound. Each track blends unique melodies and rhythms, creating
              an immersive experience that captures the essence of musical
              exploration. From upbeat tempos to soothing harmonies, this
              collection offers something for every listener.{" "}
            </p>
            <div className="flex flex-col gap-2 text-gray-300">
              {album.copyrights?.[0].text}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-accent py-10">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold text-primary md:text-3xl">
            Tracklist
          </h2>
          <div className="flex flex-col gap-2">
            {album.tracks.map((track) => (
              <Card
                className="flex items-center justify-between p-4"
                key={track.id}
              >
                <div>
                  <h3 className="font-semibold text-primary">{track.name}</h3>
                  <p className="opacity-60">
                    {format(new Date(track.durationMs!), "mm:ss")}
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-[#1DB954] hover:bg-[#1DB954] hover:opacity-70"
                >
                  <a href={track.url} target="_blank" rel="noreferrer">
                    <PlayCircle />
                  </a>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold text-orange-500 md:text-3xl">
            Related Albums
          </h2>
          <ScrollableRow className="gap-4">
            {relatedAlbums.map((album) => (
              <li
                key={album.id}
                className="snap-start hover:scale-105 hover:overflow-visible"
              >
                <Link to={`/album/${album.id}`}>
                  <Card
                    className={"shadow-md transition-transform"}
                    key={album.id}
                  >
                    <CardImage src={album.image} alt="Album Cover" />
                    <div className="relative p-4">
                      <h3 className="mb-1 h-14 overflow-hidden text-start text-lg font-semibold hover:underline">
                        {album.name}
                      </h3>
                      <h4 className="mb-2 text-sm font-medium">
                        {album.primaryArtist}
                      </h4>
                      <p>{format(album.releaseDate, "yyyy")}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ScrollableRow>
        </div>
      </section>
      {/* <div className="fixed bottom-0 right-0 z-10 h-14 w-full bg-background">
        Music player will be fixed here
      </div> */}
    </main>
  );
}
