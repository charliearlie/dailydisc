import { ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { reviews } from "~/drizzle/schema.server";
import { getUserId } from "~/services/session";

export const action = async ({ request }: ActionFunctionArgs) => {
  const loggedInUserId = await getUserId(request);
  const formData = await request.formData();

  const reviewId = formData.get("reviewId");
  const userId = formData.get("userId");

  if (userId === `${loggedInUserId}`) {
    await db.delete(reviews).where(eq(reviews.id, Number(reviewId)));

    return json({
      status: "success" as const,
    });
  }

  return json({
    status: "error" as const,
  });
};
