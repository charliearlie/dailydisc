import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { eq } from "drizzle-orm";
import {
  Calendar,
  Globe,
  Music,
  Music2,
  Tag,
  User,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";

import { Button } from "~/components/common/ui/button";
import { Card, CardContent, CardHeader } from "~/components/common/ui/card";
import { FormField } from "~/components/form/form-field";
import { ImageUpload } from "~/components/image-upload";
import { useToast } from "~/components/common/ui/use-toast";

import { db } from "~/drizzle/db.server";
import { albums, artists, artistsToAlbums } from "~/drizzle/schema.server";

import { uploadImages } from "~/services/cloudinary";
import { getAppleMusicCollectionIdFromUrl } from "~/services/itunes.api.server";
import { FileSchema } from "~/services/schemas";

const AddAlbumSchema = z.object({
  title: z.string().min(1),
  artistName: z.string(),
  releaseYear: z.number(),
  genre: z.string().optional(),
  artwork: FileSchema.optional(),
  appleMusicUrl: z.string().url().optional(),
  spotifyId: z.string().optional(),
});

function AlbumAddedToast({
  album,
}: {
  album: { title: string; artistName: string; artwork?: string };
}) {
  return (
    <div className="flex items-center gap-4">
      {album.artwork && (
        <img
          src={album.artwork}
          alt={album.title}
          className="h-12 w-12 rounded-md object-cover"
        />
      )}
      <div className="flex flex-col">
        <p className="font-medium">{album.title}</p>
        <p className="text-sm text-muted-foreground">{album.artistName}</p>
      </div>
    </div>
  );
}

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
    artistName,
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

    const artistInDb = await db.query.artists.findFirst({
      where: eq(artists.name, artistName.trim()),
    });

    if (artistInDb) {
      await db.insert(artistsToAlbums).values({
        albumId: album.id,
        artistId: artistInDb.id,
      });

      return json({
        result: submission.reply({ resetForm: true }),
        status: "success" as const,
        album: { title, artistName, artwork: image }, // Return the created album
      });
    }

    const [artist] = await db
      .insert(artists)
      .values({ name: artistName.trim() })
      .returning();

    await db.insert(artistsToAlbums).values({
      albumId: album.id,
      artistId: artist.id,
    });

    return json({
      result: submission.reply({ resetForm: true }),
      status: "success" as const,
      album: { title, artistName, artwork: image }, // Return the created album
    });
  } catch (error) {
    console.error(error);
    return json({
      result: submission.reply({ resetForm: true }),
      status: "error" as const,
    });
  }
};

export default function AddAlbum() {
  const { toast } = useToast();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (navigation.state === "idle" && actionData) {
      if (actionData.status === "success") {
        toast({
          title: "Album Added",
          description: <AlbumAddedToast album={actionData.album} />,
        });
      } else if (actionData.status === "error") {
        toast({
          title: "Error",
          description: "Failed to add album",
          variant: "destructive",
        });
      }
    }
  }, [navigation.state, actionData, toast]);

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
    <main className="container flex min-h-screen items-center justify-center space-y-6">
      <Card className="w-full max-w-2xl border-border">
        <CardHeader>
          <h1 className="text-center text-3xl font-bold leading-none tracking-tight">
            Add Album
          </h1>
        </CardHeader>
        <CardContent>
          <Form
            method="post"
            encType="multipart/form-data"
            {...getFormProps(form)}
          >
            <div className="flex justify-center p-8">
              <ImageUpload
                className="h-[172px] w-[172px] basis-1/4 rounded-lg"
                fieldProps={{
                  ...getInputProps(fields.artwork, { type: "file" }),
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField
                labelIcon={Music}
                label="Album name"
                {...getInputProps(fields.title, { type: "text" })}
              />
              <FormField
                labelIcon={Calendar}
                label="Release year"
                {...getInputProps(fields.releaseYear, { type: "text" })}
              />
              <FormField
                labelIcon={Tag}
                label="Genre"
                {...getInputProps(fields.genre, { type: "text" })}
              />
              <FormField
                labelIcon={Globe}
                label="Apple Music URL"
                {...getInputProps(fields.appleMusicUrl, { type: "text" })}
              />
              <FormField
                labelIcon={Music2}
                label="Spotify ID"
                {...getInputProps(fields.spotifyId, { type: "text" })}
              />
              <FormField
                labelIcon={User}
                label="Artist"
                {...getInputProps(fields.artistName, { type: "text" })}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Adding album...</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Add album"
              )}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
