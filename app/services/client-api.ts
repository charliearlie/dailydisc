import { Album } from "~/util/types";
import { SpotifyAlbum } from "~/util/types/spotify/spotify-response-types";

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
      releaseDate: album.release_date,
      totalTracks: album.total_tracks,
      type: album.album_type,
      url: album.external_urls.spotify,
    }));
  }

  console.error("No albums found from Spotify API", data);
  return [];
};
