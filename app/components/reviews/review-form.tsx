import { useId, useMemo } from "react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { X } from "lucide-react";

import { FormField } from "../form/form-field";
import { Label } from "../common/ui/label";
import { ReviewFormSchema } from "./types";
import { action, loader } from "../../routes/_index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../common/ui/select";
import { Button } from "../common/ui/button";
import { FormFieldTextArea } from "../form/form-field-text-area";
import { useUser } from "~/contexts/user-context";

export const ReviewForm = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formId = useId();
  const [form, fields] = useForm({
    id: `review-form-${formId}`,
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(ReviewFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ReviewFormSchema });
    },
  });
  const user = useUser();

  if (!loaderData) return <p>Album has not been selected yet..</p>;

  const { album, extraInfo } = loaderData;
  const { tracks } = album;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const albumTracks = useMemo(() => {
    if (tracks.length === 0) {
      return extraInfo?.tracks.map((track) => ({
        artist: track.artists[0].name,
        id: track.id,
        title: track.name,
        trackTimeMillis: track.durationMs,
        trackNumber: track.trackNumber,
      }));
    }

    return tracks;
  }, [tracks, extraInfo?.tracks]);

  const favouriteTracks = fields.favouriteTracks.getFieldList();

  console.log("albumTracks", albumTracks);

  return (
    <Form method="post" className="space-y-4" {...getFormProps(form)}>
      <div className="space-y-2">
        <FormField
          className="m-auto w-20"
          label="Rating"
          placeholder="1-10"
          {...getInputProps(fields.rating, { type: "number" })}
        />
        <div className="mb-8 flex w-full flex-col gap-1.5">
          <Label className="font-bold" htmlFor="category">
            Favourite tracks
          </Label>
          {favouriteTracks.map((favTrack, index) => (
            <div key={favTrack.id} className="flex">
              <span className="basis-11/12">
                <Select name={favTrack.name} value={favTrack.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent className="h-48">
                    {albumTracks?.map((track) => {
                      if (track.title) {
                        return (
                          <SelectItem
                            className="cursor-pointer"
                            key={track.id}
                            value={track.title}
                          >
                            {track.title}
                          </SelectItem>
                        );
                      }
                    })}
                  </SelectContent>
                </Select>
              </span>
              <Button
                className="px-2"
                variant="ghost"
                {...form.remove.getButtonProps({
                  name: fields.favouriteTracks.name,
                  index: index,
                })}
              >
                <X className="text-destructive" strokeWidth={3} />
              </Button>
            </div>
          ))}
          <div className="flex justify-center pb-8 pt-4">
            <Button
              className="w-full"
              variant="outline"
              {...form.insert.getButtonProps({
                name: fields.favouriteTracks.name,
              })}
            >
              {favouriteTracks.length === 0 ? "Add track" : "Add another track"}
            </Button>
          </div>
        </div>
        <FormFieldTextArea
          className="min-h-[100px] resize-none"
          label="Your Review (optional)"
          placeholder="What did you think of the album?"
          {...getInputProps(fields.review, { type: "text" })}
        />
        <input hidden name="albumId" readOnly value={loaderData?.album.id} />
        <input hidden name="userId" readOnly value={user?.userId} />
        <input hidden name="intent" readOnly value="review" />
      </div>
      <Button
        className="w-full"
        disabled={actionData?.status === "success"}
        type="submit"
      >
        {actionData?.status === "success"
          ? "Review submitted"
          : "Submit Review"}
      </Button>
    </Form>
  );
};
