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
    <Accordion type="single" collapsible>
      <AccordionItem value="reviews">
        <AccordionTrigger className="text-xl">Reviews</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard review={review} key={review.id} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
