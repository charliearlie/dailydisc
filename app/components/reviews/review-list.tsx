import { useUser } from "~/contexts/user-context";
import { ReviewCard } from "./review-card";
import { Review } from "./types";

type Props = {
  hasUserReviewed: boolean;
  reviews: Review[];
};

export const ReviewList = ({ hasUserReviewed, reviews }: Props) => {
  const user = useUser();

  // Will do this properly with roles later
  const canSeeReviews = hasUserReviewed || user.username === "charliearlie";
  return (
    <div className="flex w-full flex-col gap-4">
      {!canSeeReviews ? (
        <h3 className="w-full py-24 text-center text-2xl">
          🚨 Submit your own review to see the thoughts of others
        </h3>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard review={review} key={review.id} />
          ))}
        </>
      )}
    </div>
  );
};
