import {
  SpotifyAlbum,
  SpotifyAlbumFullDetails,
  SpotifyArtist,
} from "~/util/types/spotify/spotify-response-types";
import { fetchFurtherAlbumInfoFromMusicBrainz } from "./musicbrainz.server";

export const config = { runtime: "edge" };

export interface Album {
  artists: {
    id: string;
    name: string;
    url: string;
  }[];
  id: string;
  image: string;
  name: string;
  primaryArtist: string;
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
    "https://api.spotify.com/v1/browse/new-releases?limit=50",
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    },
  );

  const data = await response.json();

  console.log("New albums from Spotify API", JSON.stringify(data));

  if (data.albums) {
    return data.albums.items.map((album: SpotifyAlbum) => ({
      artists: album.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
      })),
      id: album.id,
      image: album.images[0].url,
      name: album.name,
      primaryArtist: album.artists[0].name,
      releaseDate: album.release_date,
      totalTracks: album.total_tracks,
      type: album.album_type,
      url: album.external_urls.spotify,
    }));
  }

  console.error("No albums found from Spotify API", data);
  return [];
};

export const getAlbumInfo = async (albumId: string, token: string) => {
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
  });

  const data: SpotifyAlbumFullDetails = await response.json();

  console.log(
    `Album details for ${albumId} from Spotify API`,
    JSON.stringify(data),
  );

  const description = await fetchFurtherAlbumInfoFromMusicBrainz({
    album: data.name,
    artist: data.artists[0].name,
  });

  return {
    artists: await getAlbumArtistsInfo(data.artists.map((artist) => artist.id)),
    copyrights: data.copyrights,
    external_urls: data.external_urls,
    images: data.images,
    label: data.label,
    name: data.name,
    id: data.id,
    releaseDate: data.release_date,
    description,
    spotifyId: data.id,
    totalTracks: data.total_tracks,
    tracks: data.tracks.items.map((track) => ({
      artists: track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
      })),
      durationMs: track.duration_ms,
      id: track.id,
      name: track.name,
      previewUrl: track.preview_url,
      trackNumber: track.track_number,
      url: track.external_urls.spotify,
    })),
    type: data.type,
  };
};

export const getAlbumArtistsInfo = async (
  artistIds: string[],
): Promise<
  {
    followers: number;
    genres: string[];
    id: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }> | null;
    name: string;
    popularity: number;
    url: string;
  }[]
> => {
  const token = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token.access_token },
    },
  );

  const data = await response.json();

  console.log("Artists from Spotify API", JSON.stringify(data));

  return data.artists.map((artist: SpotifyArtist) => ({
    followers: artist.followers.total,
    genres: artist.genres,
    id: artist.id,
    images: artist.images,
    name: artist.name,
    popularity: artist.popularity,
    url: artist.external_urls.spotify,
  }));
};

export const getAlbumsByArtist = async ({
  artistId,
  exclude,
}: {
  artistId: string;
  exclude?: string;
}): Promise<Album[]> => {
  if (!artistId) {
    console.error("No artist ID provided");
    return [];
  }
  const token = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token.access_token },
    },
  );

  const data = await response.json();

  console.log(`Albums for artistId: ${artistId}`, JSON.stringify(data.items));

  if (data.items) {
    return data.items
      .filter(
        (relatedAlbum: SpotifyAlbum) =>
          relatedAlbum.id !== exclude && relatedAlbum.album_type === "album",
      )
      .map((album: SpotifyAlbum) => ({
        artists: album.artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          url: artist.external_urls.spotify,
        })),
        primaryArtist: album.artists[0].name,
        id: album.id,
        image: album.images[0].url,
        name: album.name,
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        type: album.album_type,
        url: album.external_urls.spotify,
      }));
  }

  return [];
};

export const fetchAlbumDescriptionFromAudioDB = async ({
  album,
  artist,
}: {
  album: string;
  artist: string;
}): Promise<string> => {
  const artistTransformed = artist.replace(" ", "_");
  const albumTransformed = album.replace(" ", "_");
  const response = await fetch(
    `https://theaudiodb.com/api/v1/json/2/searchalbum.php?s=${artistTransformed}&a=${albumTransformed}`,
  );

  const data = await response.json();

  const description = data.album[0].strDescriptionEN;

  console.log(
    "Album description from AudioDB API",
    JSON.stringify(description),
  );

  return description;
};
