import { useId, useMemo } from "react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Disc, Music, Plus, Star, X } from "lucide-react";

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
import { Separator } from "../common/ui/separator";
import { Card, CardContent } from "../common/ui/card";

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

  const albumTracks = useMemo(() => {
    if (tracks.length === 0 && extraInfo?.tracks) {
      return extraInfo.tracks.map((track) => ({
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

  return (
    <Form method="post" className="space-y-6" {...getFormProps(form)}>
      {/* Rating Section */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex w-full flex-col items-center sm:items-start">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Star className="h-5 w-5 text-amber-500" />
            <h3>Your Rating</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            How would you rate this album from 1-10?
          </p>
        </div>

        <div className="w-full max-w-[120px]">
          <FormField
            className="m-auto w-full bg-accent/50 text-center text-xl font-semibold"
            label=""
            placeholder="1-10"
            {...getInputProps(fields.rating, { type: "number" })}
            min="1"
            max="10"
            step="0.5"
          />
          {fields.rating.errors ? (
            <p className="mt-1 text-xs text-destructive">
              Please enter a rating between 1 and 10
            </p>
          ) : null}
        </div>
      </div>

      <Separator />

      {/* Favorite Tracks Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Music className="h-5 w-5 text-primary" />
          <h3>Favorite Tracks</h3>
        </div>

        <div className="space-y-3">
          {favouriteTracks.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Disc className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Add your favorite tracks from the album
                </p>
              </CardContent>
            </Card>
          ) : (
            favouriteTracks.map((favTrack, index) => (
              <div key={favTrack.id} className="group flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Select name={favTrack.name} value={favTrack.value}>
                    <SelectTrigger className="w-full border-primary/10 bg-accent/50">
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {albumTracks?.map((track) => {
                        if (track.title) {
                          return (
                            <SelectItem
                              className="cursor-pointer"
                              key={track.id}
                              value={track.title}
                            >
                              <span className="flex items-center gap-2">
                                {track.trackNumber && (
                                  <span className="text-xs text-muted-foreground">
                                    {track.trackNumber}.
                                  </span>
                                )}
                                {track.title}
                              </span>
                            </SelectItem>
                          );
                        }
                        return null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full opacity-70 hover:bg-destructive/10 hover:text-destructive"
                  {...form.remove.getButtonProps({
                    name: fields.favouriteTracks.name,
                    index: index,
                  })}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove track {index + 1}</span>
                </Button>
              </div>
            ))
          )}

          <Button
            variant="outline"
            className="mt-2 w-full gap-2 border-dashed text-muted-foreground"
            {...form.insert.getButtonProps({
              name: fields.favouriteTracks.name,
            })}
          >
            <Plus className="h-4 w-4" />
            {favouriteTracks.length === 0 ? "Add a track" : "Add another track"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Review Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-lg font-medium">
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H16M8 5V3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3V5M8 5H16M12 11H16M12 16H16M8 11H8.01M8 16H8.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3>Your Review</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your thoughts about this album (optional)
            </p>
          </div>
        </div>

        <FormFieldTextArea
          className="min-h-[120px] resize-none bg-accent/50"
          label=""
          placeholder="What did you think of this album? What emotions did it evoke? Would you recommend it to others?"
          {...getInputProps(fields.review, { type: "text" })}
        />
      </div>

      {/* Hidden Fields */}
      <input hidden name="albumId" readOnly value={loaderData?.album.id} />
      <input hidden name="userId" readOnly value={user?.userId} />
      <input hidden name="intent" readOnly value="review" />

      {/* Submit Button */}
      <Button
        className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        disabled={actionData?.status === "success"}
        type="submit"
        size="lg"
      >
        {actionData?.status === "success" ? (
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Review submitted
          </span>
        ) : (
          "Submit Review"
        )}
      </Button>
    </Form>
  );
};
