import { AppleMusicAlbumDetailsResult } from "~/util/types";

type AppleMusicResponse = {
  resultCount: number;
  results: AppleMusicAlbumDetailsResult[];
};

export const getAlbumDetails = async (albumId: number) => {
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${albumId}&entity=song`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const appleMusicResponse = (await res.json()) as AppleMusicResponse;

  const tracks = appleMusicResponse.results
    .filter((result) => result.wrapperType === "track")
    .map((track) => ({
      artist: track.artistName,
      id: track.trackId,
      isStreamable: track.isStreamable,
      title: track.trackName,
      trackNumber: track.trackNumber,
      trackTimeMillis: track.trackTimeMillis,
      trackViewUrl: track.trackViewUrl,
    }));

  return tracks;
};

export const getAppleMusicCollectionIdFromUrl = (url?: string) => {
  if (!url) {
    return null;
  }

  const lastSlashIndex = url.lastIndexOf("/");
  const lastParam = url.substring(lastSlashIndex + 1);

  return lastParam;
};
