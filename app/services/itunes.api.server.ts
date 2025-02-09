import { AppleMusicAlbumDetailsResult } from "~/util/types";

type AppleMusicResponse = {
  resultCount: number;
  results: AppleMusicAlbumDetailsResult[];
};

export const getAlbumTracks = async (albumId: number) => {
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

export const getAlbumDetails = async (albumId: number) => {
  console.log("albumId", albumId);
  const res = await fetch(`https://itunes.apple.com/lookup?id=${albumId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const appleMusicResponse = (await res.json()) as AppleMusicResponse;
  const albumDetails = appleMusicResponse.results.find(
    (result) => result.wrapperType === "collection",
  );

  if (!albumDetails) {
    throw new Error("Album not found");
  }

  return {
    artistName: albumDetails.artistName,
    title: albumDetails.collectionName,
    genre: albumDetails.primaryGenreName,
    releaseYear: new Date(albumDetails.releaseDate || "").getFullYear(),
    artwork: albumDetails.artworkUrl100?.replace("100x100", "600x600"),
    collectionId: albumDetails.collectionId,
  };
};

export const getAppleMusicCollectionIdFromUrl = (url?: string) => {
  if (!url) {
    return null;
  }

  const lastSlashIndex = url.lastIndexOf("/");
  const lastParam = url.substring(lastSlashIndex + 1);

  return lastParam;
};
