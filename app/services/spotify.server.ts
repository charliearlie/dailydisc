import { artists } from "~/drizzle/schema.server";
import { SpotifyAlbum } from "~/util/types/spotify/spotify-response-types";

interface Album {
  artists: {
    id: string;
    name: string;
    url: string;
  }[];
  id: string;
  image: string;
  name: string;
  releaseDate: string;
  totalTracks: number;
  type: string;
  url: string;
}

export const getSpotifyToken = async (): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
}> => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  return response.json();
};

export const getNewAlbums = async (token: string): Promise<Album[]> => {
  const response = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=24",
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    },
  );

  const data = await response.json();

  return data.albums.items.map((album: SpotifyAlbum) => ({
    artists: album.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      url: artist.external_urls.spotify,
    })),
    id: album.id,
    image: album.images[0].url,
    name: album.name,
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    type: album.album_type,
    url: album.external_urls.spotify,
  }));
};
