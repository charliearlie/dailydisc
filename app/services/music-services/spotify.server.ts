import {
  SpotifyAlbum,
  SpotifyAlbumFullDetails,
  SpotifyArtist,
} from "~/util/types/spotify/spotify-response-types";
// import { fetchFurtherAlbumInfoFromMusicBrainz } from "./musicbrainz.server";

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

  console.log(
    "Number of new albums from Spotify API",
    data.albums.items.length,
  );

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

const fetchAlbumInfo = async (
  albumId: string,
  token: string,
  retries = 5,
  retryDelay = 1000,
): Promise<SpotifyAlbumFullDetails> => {
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
  });

  if (response.status === 429) {
    if (retries > 0) {
      const retryAfter = response.headers.get("Retry-After");
      const retryAfterMs =
        (retryAfter ? parseInt(retryAfter, 10) : retryDelay / 1000) * 1000;
      console.warn(
        `Rate limit exceeded. Retrying after ${retryAfterMs}ms. Retries left: ${retries}`,
      );

      if (retryAfterMs > 30000) {
        throw new Error("Spotify usage appears limited");
      }

      await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
      return fetchAlbumInfo(albumId, token, retries - 1, retryDelay * 2);
    } else {
      throw new Error("Max retries reached");
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

export const getAlbumInfo = async (albumId: string) => {
  const token = await getSpotifyToken();

  try {
    const data: SpotifyAlbumFullDetails = await fetchAlbumInfo(
      albumId,
      token.access_token,
    );

    console.log(`Album title for ${albumId} from Spotify API`, data.name);

    return {
      artists: await getAlbumArtistsInfo(
        data.artists.map((artist) => artist.id),
      ),
      copyrights: data.copyrights,
      external_urls: data.external_urls,
      images: data.images,
      label: data.label,
      name: data.name,
      id: data.id,
      releaseDate: data.release_date,
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
  } catch (error) {
    console.error("Error fetching album info from Spotify API", error);
    return null;
  }
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

  console.log(
    "Artists from Spotify API",
    JSON.stringify(data.artists.map((artist: SpotifyArtist) => artist.name)),
  );

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

  console.log(`Number of albums for artistId ${artistId}: ${data.total}`);

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

export const getAlbumsFromPlaylist = async (): Promise<Album[]> => {
  const playlistId = "1ClfxQ4O37FafAAGnvctsc";

  const token = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token.access_token },
    },
  );

  const data = await response.json();

  const albumIds = data.items
    .map((album: { track: { album: SpotifyAlbum } }) => album.track.album.id)
    .join(",");

  const albumResponse = await fetch(
    `https://api.spotify.com/v1/albums?ids=${albumIds}`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token.access_token },
    },
  );

  const albumData = await albumResponse.json();

  console.log("Number of tracks from playlist", albumData.albums.length);
  if (albumData.albums) {
    return albumData.albums
      .map((album: SpotifyAlbum) => ({
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
      }))
      .sort(
        (a: Album, b: Album) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      );
  }

  return [];
};

export const searchAlbums = async (query: string): Promise<Album[]> => {
  const token = await getSpotifyToken();

  const searchParams = new URLSearchParams({
    q: query,
    type: "album",
    limit: "10",
  });

  const response = await fetch(
    `https://api.spotify.com/v1/search?${searchParams.toString()}`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token.access_token },
    },
  );

  const data = await response.json();

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
