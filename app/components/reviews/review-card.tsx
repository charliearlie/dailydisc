import { format, formatDistance, subDays } from "date-fns";
import { Card } from "../common/ui/card";
import CardContent from "../common/ui/card/card-content";
import CardHeader from "../common/ui/card/card-header";
import { Review } from "./types";

type Props = {
  review: Review;
};
export const ReviewCard = ({ review }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold">{review.user.username}</h4>
        <span className="text-xs">
          {formatDistance(new Date(review.createdAt), new Date(), {
            addSuffix: true,
          })}
        </span>
      </div>

      <p>Favourite Track: {review.favouriteTrack}</p>
      {review.review && <p>Review: {review.review}</p>}
      <p className="my-2">
        <span className="text-xl font-semibold">{review.rating / 2} / </span>10
      </p>
    </div>
  );
};
