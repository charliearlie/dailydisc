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
    <Card>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <h4>{review.user.username}</h4>
          <span className="text-sm">
            {formatDistance(new Date(review.createdAt), new Date(), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg">Rating: {review.rating}</p>
        <p className="text-lg">Favourite Track: {review.favouriteTrack}</p>
        {review.review && <p>Review: {review.review}</p>}
      </CardContent>
    </Card>
  );
};
