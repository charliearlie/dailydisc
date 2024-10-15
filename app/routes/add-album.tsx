import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, defer, json } from "@remix-run/node";
import { Await, Form, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
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
  spotifyId: z.string().optional(),
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

  const {
    appleMusicUrl,
    artistId,
    artwork,
    genre,
    releaseYear,
    spotifyId,
    title,
  } = submission.value;

  const [image] = await uploadImages(artwork);
  const appleMusicCollectionId =
    getAppleMusicCollectionIdFromUrl(appleMusicUrl);

  try {
    const [album] = await db
      .insert(albums)
      .values({
        title,
        year: String(releaseYear),
        genre,
        image,
        appleMusicUrl,
        appleMusicCollectionId,
        spotifyUrl: spotifyId,
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
  } catch (error) {
    console.error(error);
    return json({
      result: submission.reply({ resetForm: true }),
      status: "error" as const,
    });
  }
};

export const loader = async () => {
  const allArtistsPromise = db.query.artists.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return defer({
    artists: Promise.resolve().then(() => allArtistsPromise),
  });
};

export default function AddArtistRoute() {
  const { artists } = useLoaderData<typeof loader>();
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
    <main className="container space-y-8 py-8 md:py-16 lg:space-y-12">
      <h1 className="text-3xl font-semibold">Add album</h1>
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
          label="Spotify ID"
          {...getInputProps(fields.spotifyId, { type: "text" })}
        />
        <div className="mb-8 flex w-full flex-col gap-1.5">
          <Label className="font-bold" htmlFor="category">
            Artist
          </Label>
          <Suspense fallback={<p>Loading...</p>}>
            <Await resolve={artists}>
              {(artists) => (
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
              )}
            </Await>
          </Suspense>

          <span>
            Cant find the artist in this list?{" "}
            <Link className="text-primary underline" to="/add-artist">
              Add artist
            </Link>
          </span>
        </div>
        <Button type="submit">Add album</Button>
      </Form>
    </main>
  );
}
