import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
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
import { Card } from "~/components/common/ui/card";
import { PlayCircle } from "lucide-react";
import { getDailyAlbumDate } from "~/services/album.server";
import { RelatedAlbums } from "~/components/album/related-albums";
import { AlbumDuration } from "~/components/album/album-duration";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data?.album) {
    return [
      { title: `${data?.album.name} | DailyDisc` },
      {
        name: "description",
        content: `Album by ${data?.album.artists[0].name}`,
      },
      {
        property: "og:image",
        content: data?.album.images?.[0].url,
      },
    ];
  }

  return [{ title: `DailyDisc` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariantResponse(params.spotifyId, "Expected params.spotifyId");
  const album = await getAlbumInfo(params.spotifyId);
  if (!album) {
    return json({ album: null, dailyAlbumDate: null, relatedAlbums: null });
  }
  const relatedAlbums = await getAlbumsByArtist({
    artistId: album.artists[0]?.id,
    exclude: album.id,
  });

  const dailyAlbumDate = await getDailyAlbumDate(album.id);

  return json({ album, dailyAlbumDate, relatedAlbums });
};

export default function AlbumRoute() {
  const { album, dailyAlbumDate, relatedAlbums } =
    useLoaderData<typeof loader>();

  if (!album) {
    return <h2>The Spotify API has goofed</h2>;
  }
  const numberOfTracks = album.tracks.length;
  const albumDuration = album.tracks.reduce(
    (acc, track) => acc + track.durationMs!,
    0,
  );

  return (
    <main className="relative flex flex-col">
      <section className="to-gradientend  bg-gradient-to-tl from-background via-accent py-12 md:py-20 lg:py-24">
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
            <h1 className="self-center text-3xl font-bold text-card-foreground md:text-4xl">
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
                  <Avatar className="h-24 w-24 border-2 border-primary-foreground bg-primary-foreground">
                    <AvatarImage src={artist.images?.[0].url} />
                    <AvatarFallback>{artist.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{artist.name}</span>
                </a>
              ))}
            </div>
            <p className="hidden md:block md:h-8"></p>
            <p>
              {numberOfTracks} tracks,{" "}
              <AlbumDuration durationInMS={albumDuration} />
            </p>
            {dailyAlbumDate && (
              <Link
                className="font-semibold text-primary hover:underline"
                to={`/?date=${format(new Date(dailyAlbumDate), "yyyy-MM-dd")}`}
              >
                Album of the day:{" "}
                {format(new Date(dailyAlbumDate), "eee d MMM ''yy")}
              </Link>
            )}
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
          <div className="gap-4 px-10">
            <RelatedAlbums albums={relatedAlbums} />
          </div>
        </div>
      </section>
      {/* <div className="fixed bottom-0 right-0 z-10 h-14 w-full bg-background">
        Music player will be fixed here
      </div> */}
    </main>
  );
}
