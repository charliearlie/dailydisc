import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../common/ui/accordion";
import { Button } from "../common/ui/button";
import { ReviewCard } from "./review-card";
import { Review } from "./types";

type Props = {
  reviews: Review[];
};

export const ReviewList = ({ reviews }: Props) => {
  return (
    <div className="flex w-full flex-col gap-4">
      {reviews.map((review) => (
        <ReviewCard review={review} key={review.id} />
      ))}
    </div>
  );
};
