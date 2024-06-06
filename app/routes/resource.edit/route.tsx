import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { EditReviewFormSchema } from "~/components/reviews/types";
import { db } from "~/drizzle/db.server";
import { reviews } from "~/drizzle/schema.server";
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

  const { reviewId, favouriteTracks, rating, review, userId } =
    submission.value;

  if (userId === `${loggedInUserId}`) {
    await db
      .update(reviews)
      .set({
        favouriteTrack: favouriteTracks,
        rating: rating * 2,
        review: review || "",
      })
      .where(eq(reviews.id, Number(reviewId)));
  }

  return json({
    result: submission.reply({ resetForm: true }),
    status: "success" as const,
  });
};
