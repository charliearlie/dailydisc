import { z } from "zod";

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

const BaseReviewFormSchema = z.object({
  rating: z.number().multipleOf(0.5).min(1).max(10),
  review: z.string().optional(),
  userId: z.string(),
});

export const ReviewFormSchema = BaseReviewFormSchema.extend({
  albumId: z.string(),
  favouriteTracks: z.array(z.string()),
});

export const EditReviewFormSchema = BaseReviewFormSchema.extend({
  favouriteTracks: z.string(),
  reviewId: z.string(),
});

export const DeleteReviewSchema = z.object({
  reviewId: z.string(),
});
