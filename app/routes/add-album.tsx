import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/common/ui/button";
import { Label } from "~/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/ui/select";
import { FormField } from "~/components/form/form-field";
import { ImageUpload } from "~/components/image-upload";
import { db } from "~/drizzle/db.server";
import { albums, artists, artistsToAlbums } from "~/drizzle/schema.server";
import { uploadImages } from "~/services/cloudinary";
import { getAppleMusicCollectionIdFromUrl } from "~/services/itunes.api.server";
import { FileSchema } from "~/services/schemas";

const AddAlbumSchema = z.object({
  title: z.string().min(1),
  artistId: z.string(),
  releaseYear: z.number(),
  genre: z.string().optional(),
  artwork: FileSchema.optional(),
  appleMusicUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: AddAlbumSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), status: submission.status } as const,
      {
        status: submission.status === "error" ? 400 : 200,
      },
    );
  }

  const { appleMusicUrl, artistId, artwork, genre, releaseYear, title } =
    submission.value;

  const [image] = await uploadImages(artwork);
  const appleMusicCollectionId =
    getAppleMusicCollectionIdFromUrl(appleMusicUrl);

  console.log({ appleMusicUrl, appleMusicCollectionId });

  const [album] = await db
    .insert(albums)
    .values({
      title,
      year: String(releaseYear),
      genre,
      image,
      appleMusicUrl,
      appleMusicCollectionId,
    })
    .returning();

  await db.insert(artistsToAlbums).values({
    albumId: album.id,
    artistId: Number(artistId),
  });

  return json({
    result: submission.reply({ resetForm: true }),
    status: "success" as const,
  });
};

export const loader = async () => {
  const allArtists = await db.select().from(artists);

  return json(allArtists.sort((a, b) => a.name.localeCompare(b.name)));
};

export default function AddArtistRoute() {
  const artists = useLoaderData<typeof loader>();
  const actionData = useLoaderData<typeof action>();

  const [form, fields] = useForm({
    id: "artist-form",
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(AddAlbumSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddAlbumSchema });
    },
  });

  return (
    <div>
      <h1>Add album</h1>
      <Form method="post" encType="multipart/form-data" {...getFormProps(form)}>
        <ImageUpload
          className="h-[172px] w-[172px] basis-1/4 rounded-lg"
          fieldProps={{
            ...getInputProps(fields.artwork, { type: "file" }),
          }}
        />
        <FormField
          label="Name"
          {...getInputProps(fields.title, { type: "text" })}
        />
        <FormField
          label="Release year"
          {...getInputProps(fields.releaseYear, { type: "text" })}
        />
        <FormField
          label="Genre"
          {...getInputProps(fields.genre, { type: "text" })}
        />
        <FormField
          label="Apple Music URL"
          {...getInputProps(fields.appleMusicUrl, { type: "text" })}
        />
        <FormField
          label="Spotify URL"
          {...getInputProps(fields.spotifyUrl, { type: "text" })}
        />
        <div className="mb-8 flex w-full flex-col gap-1.5">
          <Label className="font-bold" htmlFor="category">
            Artist
          </Label>
          <Select name="artistId">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select artist" />
            </SelectTrigger>
            <SelectContent className="h-96">
              {artists.map((option) => (
                <SelectItem
                  className="cursor-pointer"
                  key={option.id}
                  value={String(option.id)}
                >
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Add artist</Button>
      </Form>
    </div>
  );
}
