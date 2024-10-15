import { ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { albums, reviews } from "~/drizzle/schema.server";
import { getAverageRatingAndReviewCount } from "~/services/album.server";
import { getUserId } from "~/services/session";

export const action = async ({ request }: ActionFunctionArgs) => {
  const loggedInUserId = await getUserId(request);
  const formData = await request.formData();

  const reviewId = formData.get("reviewId");
  const userId = formData.get("userId");

  if (userId === `${loggedInUserId}`) {
    const reviewToDelete = await db.query.reviews.findFirst({
      where: eq(reviews.id, Number(reviewId)),
      columns: {
        albumId: true,
        id: true,
        rating: true,
      },
    });

    if (!reviewToDelete) {
      return json({
        status: "error" as const,
      });
    }

    const { averageRating, reviewCount } = await getAverageRatingAndReviewCount(
      reviewToDelete.albumId,
    );

    const newAverageRating = Number(
      (
        (averageRating * reviewCount - reviewToDelete.rating) /
        (reviewCount - 1)
      ).toFixed(1),
    );

    await db.delete(reviews).where(eq(reviews.id, reviewToDelete.id));

    await db
      .update(albums)
      .set({
        averageRating: newAverageRating,
      })
      .where(eq(albums.id, reviewToDelete.albumId));

    return json({
      status: "success" as const,
    });
  }

  return json({
    status: "error" as const,
  });
};
