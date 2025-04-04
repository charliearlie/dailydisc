import { FileText } from "lucide-react";
import { useUser } from "~/contexts/user-context";
import { ReviewCard } from "./review-card";
import { Review } from "./types";

type Props = {
  hasUserReviewed: boolean;
  reviews: Review[];
};

export const ReviewList = ({ hasUserReviewed, reviews }: Props) => {
  const user = useUser();
  const canSeeReviews = hasUserReviewed || user.username === "charliearlie";

  if (!canSeeReviews) {
    return (
      <div className="flex h-60 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-primary/5 p-6 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-medium">Reviews are hidden</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit your own review to see what others think about this album
          </p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-primary/5 p-6 text-center">
        <h3 className="text-lg font-medium">No reviews yet</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to review this album!
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {reviews.map((review) => (
        <ReviewCard review={review} key={review.id} />
      ))}
    </div>
  );
};
