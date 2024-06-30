export type AppleMusicAlbumDetailsResult = {
  wrapperType: "collection" | "track";
  artistId: number;
  artistName: string;
  collectionId: number;
  collectionName: string;
  collectionCensoredName: string;
  collectionViewUrl: string;
  artworkUrl60: string;
  artworkUrl100: string;
  collectionExplicitness: string;
  country: string;
  currency: string;
  primaryGenreName: string;

  // Fields specific to MusicCollection
  collectionType?: string;
  amgArtistId?: number;
  contentAdvisoryRating?: string;
  trackCount?: number;
  copyright?: string;
  releaseDate?: string;

  // Fields specific to MusicTrack
  kind?: string;
  trackId?: number;
  trackName?: string;
  trackCensoredName?: string;
  artistViewUrl?: string;
  trackViewUrl?: string;
  previewUrl?: string;
  artworkUrl30?: string;
  trackPrice?: number;
  trackExplicitness?: string;
  discCount?: number;
  discNumber?: number;
  trackNumber?: number;
  trackTimeMillis?: number;
  isStreamable?: boolean;
};

export type ReplaceDateProperties<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  listenDate: string;
};

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
