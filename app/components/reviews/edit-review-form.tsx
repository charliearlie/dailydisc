import { useFetcher } from "@remix-run/react";
import { FormField } from "../form/form-field";
import { Review } from "./types";
import { Button } from "../common/ui/button";
import { FormFieldTextArea } from "../form/form-field-text-area";
import { useUser } from "~/contexts/user-context";
import { DialogClose, DialogFooter } from "../common/ui/dialog";

export const EditReviewForm = ({ userReview }: { userReview: Review }) => {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/resource/edit" className="space-y-4">
      <div className="space-y-2">
        <FormField
          name="rating"
          className="m-auto w-20"
          label="Rating"
          placeholder="1-10"
          defaultValue={userReview.rating / 2}
        />
        <FormFieldTextArea
          name="favouriteTracks"
          className="min-h-[100px] resize-none"
          label="Favourite tracks"
          defaultValue={userReview.favouriteTrack!}
        />
        <FormFieldTextArea
          name="review"
          className="min-h-[100px] resize-none"
          label="Your Review (optional)"
          placeholder="What did you think of the album?"
          defaultValue={userReview.review || ""}
        />
        <input hidden name="reviewId" readOnly value={userReview.id} />
        <input hidden name="userId" readOnly value={userReview.userId} />
      </div>
      <DialogFooter>
        <DialogClose>
          <Button className="w-full" type="submit">
            Save changes
          </Button>
        </DialogClose>
      </DialogFooter>
    </fetcher.Form>
  );
};
