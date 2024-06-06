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
import { useUser } from "~/contexts/user-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../common/ui/alert-dialog";
import { Form, useFetcher } from "@remix-run/react";
import { useToast } from "../common/ui/use-toast";
import { ReviewDeleteDialog } from "./review-delete-dialog";
import { ReviewEditDialog } from "./review-edit-dialog";

type Props = {
  review: Review;
};
export const ReviewCard = ({ review }: Props) => {
  const user = useUser();
  const { toast } = useToast();
  const fetcher = useFetcher();

  const isLoggedInUsersReview = user?.userId === review.userId;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold">{review.user.username}</h4>
        {isLoggedInUsersReview ? (
          <div className="flex items-center gap-2">
            <ReviewEditDialog review={review} />
            <ReviewDeleteDialog reviewId={review.id} userId={review.userId} />
          </div>
        ) : null}
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
