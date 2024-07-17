import * as React from "react";

import { useMediaQuery } from "~/hooks/use-media-query";
import { Button } from "~/components/common/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/common/ui/drawer";
import { Review } from "./types";
import { EditReviewForm } from "./edit-review-form";

export function ReviewEditDialog({ review }: { review: Review }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="p-2 text-start hover:bg-orange-50">
          Edit
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit your review</DialogTitle>
          </DialogHeader>
          <EditReviewForm onSubmit={() => setOpen(false)} userReview={review} />
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="p-2 text-start hover:bg-orange-50">
        Edit
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-start">
          <DrawerTitle>Edit your review</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <EditReviewForm onSubmit={() => setOpen(false)} userReview={review} />
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
