export const fetchFurtherAlbumInfoFromMusicBrainz = async ({
  album,
  artist,
}: {
  album: string;
  artist: string;
}) => {
  const searchResponse = await fetch(
    `http://musicbrainz.org/ws/2/release/?query=album:${encodeURIComponent(album)}%20AND%20artist:${encodeURIComponent(artist)}&fmt=json`,
  );

  const data = await searchResponse.json();

  const closestMatch = data.releases[0];

  const detailsResponse = await fetch(
    `http://musicbrainz.org/ws/2/release/${closestMatch.id}?inc=artist-credits+labels+recordings&fmt=json`,
  );

  const details = await detailsResponse.json();

  console.log("Album details from MusicBrainz API", JSON.stringify(details));

  return details;
};
