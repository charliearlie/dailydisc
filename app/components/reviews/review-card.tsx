import { formatDistance } from "date-fns";
import { Review } from "./types";
import { useUser } from "~/contexts/user-context";
import { ReviewDeleteDialog } from "./review-delete-dialog";
import { ReviewEditDialog } from "./review-edit-dialog";
import { EllipsisVertical } from "lucide-react";
import { Popover } from "../common/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Separator } from "../common/ui/separator";

type Props = {
  review: Review;
};
export const ReviewCard = ({ review }: Props) => {
  const user = useUser();

  const isLoggedInUsersReview = user?.userId === review.userId;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold">{review.user.username}</h4>
        {isLoggedInUsersReview ? (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger>
                <EllipsisVertical />
              </PopoverTrigger>
              <PopoverContent className="flex flex-col bg-card shadow-md">
                <h4 className="p-2 font-semibold">Manage review</h4>
                <Separator />
                <ReviewEditDialog review={review} />
                <ReviewDeleteDialog
                  reviewId={review.id}
                  userId={review.userId}
                />
              </PopoverContent>
            </Popover>
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
