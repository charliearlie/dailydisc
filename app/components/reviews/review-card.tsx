import { formatDistance } from "date-fns";
import { EllipsisVertical, ListMusic, Music, Star } from "lucide-react";
import { useUser } from "~/contexts/user-context";
import { Review } from "./types";
import { ReviewDeleteDialog } from "./review-delete-dialog";
import { ReviewEditDialog } from "./review-edit-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../common/ui/avatar";
import { Badge } from "../common/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "../common/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";
import { Separator } from "../common/ui/separator";

type Props = {
  review: Review;
};

export const ReviewCard = ({ review }: Props) => {
  const user = useUser();

  const isLoggedInUsersReview = user?.userId === review.userId;
  const rating = review.rating / 2;
  const favouriteTracks = review.favouriteTrack
    ? review.favouriteTrack.split(" | ")
    : [];

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary bg-primary/10">
            <AvatarFallback className="text-sm font-medium text-primary">
              {review.user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{review.user.username}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDistance(new Date(review.createdAt), new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium">{rating}</span>
            <span className="text-xs">/10</span>
          </Badge>

          {isLoggedInUsersReview && (
            <Popover>
              <PopoverTrigger>
                <button className="rounded-full p-1 hover:bg-accent">
                  <EllipsisVertical className="h-5 w-5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col bg-card p-0 shadow-md">
                <h4 className="p-2 font-semibold">Manage review</h4>
                <Separator />
                <ReviewEditDialog review={review} />
                <ReviewDeleteDialog
                  reviewId={review.id}
                  userId={review.userId}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0">
        {favouriteTracks.length > 0 && (
          <div className="mb-3 rounded-md bg-primary/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <ListMusic className="h-4 w-4 text-primary" />
              <h5 className="text-sm font-medium">Favorite Tracks</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {favouriteTracks.map((track, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-card/80 px-2 py-1"
                >
                  <Music className="h-3 w-3 text-primary" />
                  <span className="text-xs">{track.trim()}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {review.review && (
          <div className="prose-sm max-w-none text-foreground">
            {review.review}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
