import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
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
import { useId } from "react";

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

  const { album } = loaderData;
  const { tracks } = album;

  const favouriteTracks = fields.favouriteTracks.getFieldList();

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
          {favouriteTracks.map((favTrack) => (
            <Select
              key={favTrack.id}
              name={favTrack.name}
              value={favTrack.value}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select track" />
              </SelectTrigger>
              <SelectContent className="h-48">
                {tracks.map((track) => {
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
