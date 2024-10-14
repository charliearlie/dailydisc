import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { EditReviewFormSchema } from "~/components/reviews/types";
import { db } from "~/drizzle/db.server";
import { albums, reviews } from "~/drizzle/schema.server";
import { getAverageRatingAndReviewCount } from "~/services/album.server";
import { getUserId } from "~/services/session";

export const action = async ({ request }: ActionFunctionArgs) => {
  const loggedInUserId = await getUserId(request);
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: EditReviewFormSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), status: submission.status } as const,
      {
        status: submission.status === "error" ? 400 : 200,
      },
    );
  }

  const { albumId, reviewId, favouriteTracks, rating, review, userId } =
    submission.value;

  const existingReview = await db.query.reviews.findFirst({
    where: eq(reviews.id, Number(reviewId)),
    columns: {
      rating: true,
    },
  });

  const existingRating = existingReview?.rating;

  if (userId === `${loggedInUserId}` && existingRating) {
    const { averageRating, reviewCount } = await getAverageRatingAndReviewCount(
      Number(albumId),
    );
    await db
      .update(reviews)
      .set({
        favouriteTrack: favouriteTracks,
        rating: rating * 2,
        review: review || "",
      })
      .where(eq(reviews.id, Number(reviewId)));

    const newAverageRating =
      (averageRating * reviewCount - existingRating / 2 + rating) / 2;

    await db
      .update(albums)
      .set({
        averageRating: Number(newAverageRating.toFixed(1)),
      })
      .where(eq(albums.id, Number(albumId)));
  }

  return json({
    result: submission.reply({ resetForm: true }),
    status: "success" as const,
  });
};
