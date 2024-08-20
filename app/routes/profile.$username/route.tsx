import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Badge } from "~/components/common/ui/badge";
import { Card, CardContent } from "~/components/common/ui/card";
import { UserReviewChart } from "~/components/reviews/user-review-chart";
import { getUserFromRequestContext } from "~/services/session";
import { getUserByUsername, getReviewsByUserId } from "~/services/user.server";
import { invariantResponse } from "~/util/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariantResponse(params.username, "Expected params.username");

  const loggedInUser = await getUserFromRequestContext(request);
  const profileUser = await getUserByUsername(params.username);

  const reviews = await getReviewsByUserId(profileUser.id);

  const aggregated = reviews.reduce<Record<number, number>>((acc, review) => {
    const actualRating = review.rating / 2;
    acc[actualRating] = (acc[actualRating] || 0) + 1;
    return acc;
  }, {});

  const allRatings = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5);

  const reviewsSummary = allRatings.map((rating) => ({
    rating,
    count: aggregated[rating] || 0,
  }));

  return json({
    loggedInUser: {
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    },
    reviewCount: reviews.length,
    reviewsSummary,
    user: { username: profileUser.username, email: profileUser.email },
  });
};

export default function ProfileRoute() {
  const { loggedInUser, reviewCount, reviewsSummary, user } =
    useLoaderData<typeof loader>();

  return (
    <main className="container space-y-8 py-8 md:py-16 lg:space-y-12">
      <section>
        <Card>
          <CardContent className="flex justify-center">
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p>{reviewCount} reviews</p>
              <div>
                <h3>Favourite genres</h3>
                <Badge>Hip-Hop</Badge>
                <Badge>Rock</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <section>
        <UserReviewChart reviews={reviewsSummary} />
        <h2 className="text-xl">You</h2>
        <p>Username: {loggedInUser.username}</p>
        <p>Email: {loggedInUser.email}</p>
      </section>
      <section>
        <h2 className="text-xl">
          Are you the user whose profile we&pos;re viewing?
        </h2>
        <p
          className={
            loggedInUser.username === user.username
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {loggedInUser.username === user.username ? "Yes" : "No"}
        </p>
      </section>
    </main>
  );
}
