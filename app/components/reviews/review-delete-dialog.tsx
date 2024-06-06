import * as React from "react";

import { useMediaQuery } from "~/hooks/use-media-query";
import { Button } from "~/components/common/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/common/ui/drawer";
import { Form, useFetcher } from "@remix-run/react";
import { useToast } from "../common/ui/use-toast";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../common/ui/alert-dialog";

export function ReviewDeleteDialog({
  reviewId,
  userId,
}: {
  reviewId: number;
  userId: number;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const fetcher = useFetcher();
  const { toast } = useToast();

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <Trash className="h-3 w-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete your review?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Form
              method="post"
              onSubmit={(event) => {
                const formData = new FormData(event.currentTarget);
                fetcher.submit(formData, {
                  method: "POST",
                  action: "/resource/delete",
                });
                toast({
                  title: "Your review has been deleted",
                  variant: "destructive",
                });
              }}
            >
              <input hidden name="reviewId" readOnly value={reviewId} />
              <input hidden name="userId" readOnly value={userId} />
              <div className="flex items-center justify-end gap-2">
                <AlertDialogCancel asChild>
                  <>
                    <Button type="submit" variant="destructive">
                      Delete
                    </Button>
                    <Button variant="outline">Cancel</Button>
                  </>
                </AlertDialogCancel>
              </div>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            Are you sure you want to delete your review?
          </DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Form
            method="post"
            onSubmit={(event) => {
              const formData = new FormData(event.currentTarget);
              fetcher.submit(formData, {
                method: "POST",
                action: "/resource/delete",
              });
              toast({
                title: "Your review has been deleted",
                variant: "destructive",
              });
            }}
          >
            <input hidden name="reviewId" readOnly value={reviewId} />
            <input hidden name="userId" readOnly value={userId} />
            <Button type="submit" className="w-full" variant="destructive">
              Delete
            </Button>
          </Form>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
