export type Review = {
  // There must be a way to infer this from Drizzle ffs
  id: number;
  albumId: number;
  rating: number;
  favouriteTrack: string | null;
  review: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
  };
};
