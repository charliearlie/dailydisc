import { formatDistance } from "date-fns";
import { Review } from "./types";
import { Button } from "../common/ui/button";
import { Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../common/ui/dialog";
import { EditReviewForm } from "./edit-review-form";

type Props = {
  review: Review;
};
export const ReviewCard = ({ review }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold">{review.user.username}</h4>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>Edit review</DialogHeader>
              <EditReviewForm userReview={review} />
            </DialogContent>
          </Dialog>
          <Button variant="destructive">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p>Favourite Track: {review.favouriteTrack}</p>
      {review.review && <p>Review: {review.review}</p>}
      <p className="my-2 flex justify-between">
        <span>
          <span className="text-xl font-semibold">{review.rating / 2} /</span>{" "}
          10
        </span>
        <span className="text-xs">
          {formatDistance(new Date(review.createdAt), new Date(), {
            addSuffix: true,
          })}
        </span>
      </p>
    </div>
  );
};
