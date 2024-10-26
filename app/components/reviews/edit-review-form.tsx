import { Form, useFetcher } from "@remix-run/react";
import { FormField } from "../form/form-field";
import { Review } from "./types";
import { Button } from "../common/ui/button";
import { FormFieldTextArea } from "../form/form-field-text-area";
import { useToast } from "../common/ui/use-toast";

export const EditReviewForm = ({
  onSubmit,
  userReview,
}: {
  onSubmit: () => void;
  userReview: Review;
}) => {
  const fetcher = useFetcher();
  const { toast } = useToast();

  return (
    <Form
      method="post"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        fetcher.submit(formData, {
          method: "POST",
          action: "/resource/edit",
        });
        onSubmit();
        toast({
          title: "Your review has successfully been edited",
        });
      }}
      className="space-y-4"
    >
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
        <input hidden name="albumId" readOnly value={userReview.albumId} />
        <input hidden name="reviewId" readOnly value={userReview.id} />
        <input hidden name="userId" readOnly value={userReview.userId} />
      </div>
      <Button className="w-full" type="submit">
        Save changes
      </Button>
    </Form>
  );
};
