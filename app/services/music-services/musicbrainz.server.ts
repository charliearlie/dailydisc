export const fetchFurtherAlbumInfoFromMusicBrainz = async ({
  album,
}: {
  album: string;
  artist: string;
}) => {
  const uri = `https://itunes.apple.com/search?term=${album.replace(
    " ",
    "+",
  )}+${album.replace(" ", "+")}&media=music&entity=album`;
  const searchResponse = await fetch(uri);

  const data = await searchResponse.json();

  console.log("data", data);

  return {};
};

interface ArtistCredit {
  name: string;
}

interface ReleaseGroup {
  title: string;
  "artist-credit": ArtistCredit[];
}

interface MusicBrainzResponse {
  "release-groups": ReleaseGroup[];
}

export const fetchTrendingAlbums = async () => {
  const url = "https://musicbrainz.org/ws/2/release-group/";
  const params = new URLSearchParams({
    query: "primarytype:album AND status:official",
    fmt: "json",
    limit: "10",
    offset: "0",
  });
  const searchResponse = await fetch(`${url}?${params.toString()}`);

  const data: MusicBrainzResponse = await searchResponse.json();
  const albums = data["release-groups"];

  albums.forEach((album) => {
    const artists = album["artist-credit"]
      .map((artist) => artist.name)
      .join(", ");
    console.log(`Album: ${JSON.stringify(album)}, Artist(s): ${artists}`);
  });
};
