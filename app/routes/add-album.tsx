import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useNavigation,
} from "@remix-run/react";
import { and, eq, exists } from "drizzle-orm";
import { Calendar, Globe, Music, Tag, User, Loader2 } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";

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
import { Switch } from "~/components/common/ui/switch";
import { AlbumDetailsResponse } from "./api.apple-music";

const AddAlbumSchema = z.object({
  title: z.string().min(1),
  artistName: z.string(),
  releaseYear: z.string().transform((val) => Number(val)),
  genre: z.string().optional(),
  artwork: FileSchema.optional(),
  appleMusicUrl: z.string().url().optional(),
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

  const { appleMusicUrl, artistName, artwork, genre, releaseYear, title } =
    submission.value;

  const [image] = await uploadImages(artwork);
  const appleMusicCollectionId =
    getAppleMusicCollectionIdFromUrl(appleMusicUrl);

  try {
    const artistInDb = await db.query.artists.findFirst({
      where: eq(artists.name, artistName.trim()),
    });

    const albumInDb = await db.query.albums.findFirst({
      where: and(
        eq(albums.title, title),
        exists(
          db
            .select()
            .from(artistsToAlbums)
            .where(
              and(
                eq(artistsToAlbums.albumId, albums.id),
                eq(artistsToAlbums.artistId, artistInDb?.id || 0),
              ),
            ),
        ),
      ),
    });

    if (albumInDb) {
      return json({
        result: submission.reply(),
        status: "error" as const,
        error: "This album already exists for this artist",
      });
    }

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

type FormFields = {
  title: string;
  artistName: string;
  releaseYear: string;
  genre?: string;
  appleMusicUrl?: string;
  artwork?: string | null;
};

const defaultFormState: FormFields = {
  title: "",
  artistName: "",
  releaseYear: "",
  genre: "",
  appleMusicUrl: "",
};

export default function AddAlbum() {
  const { toast } = useToast();
  const [useAppleMusic, setUseAppleMusic] = useState(false);
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  const fetcher = useFetcher<AlbumDetailsResponse>();

  const [formData, setFormData] = useState<FormFields>(defaultFormState);

  useEffect(() => {
    const albumData = fetcher.data as AlbumDetailsResponse | undefined;
    if (albumData && !albumData.error) {
      setFormData((prevData) => ({
        ...prevData,
        title: albumData.title,
        artistName: albumData.artistName,
        releaseYear: String(albumData.releaseYear),
        genre: albumData.genre || "",
        appleMusicUrl: formData.appleMusicUrl,
      }));

      if (albumData.artwork) {
        fetch(albumData.artwork)
          .then((response) => response.blob())
          .then((blob) => {
            const file = new File([blob], "artwork.jpg", {
              type: "image/jpeg",
            });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const fileInput = document.querySelector(
              'input[type="file"]',
            ) as HTMLInputElement;
            if (fileInput) {
              fileInput.files = dataTransfer.files;
              // Trigger change event to update the preview
              fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
          })
          .catch((error) => {
            console.error("Error fetching artwork:", error);
            toast({
              title: "Error",
              description: "Failed to fetch album artwork",
              variant: "destructive",
            });
          });
      }
    }
  }, [fetcher.data, formData.appleMusicUrl, toast]);

  const [form, fields] = useForm({
    id: "artist-form",
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(AddAlbumSchema),
    onValidate({ formData: data }) {
      return parseWithZod(data, { schema: AddAlbumSchema });
    },
    defaultValue: formData,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (navigation.state === "idle" && actionData) {
      if (actionData.status === "success") {
        toast({
          title: "Album Added",
          description: <AlbumAddedToast album={actionData.album} />,
        });
        setFormData(defaultFormState);
      } else if (actionData.status === "error") {
        toast({
          title: "Error",
          description: "Failed to add album",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }, [navigation.state, actionData, toast]);

  return (
    <main className="container flex min-h-screen items-center justify-center space-y-6">
      <Card className="w-full max-w-2xl border-border">
        <CardHeader>
          <h1 className="text-center text-3xl font-bold leading-none tracking-tight">
            Add Album
          </h1>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-2">
            <Switch
              checked={useAppleMusic}
              onCheckedChange={setUseAppleMusic}
            />
            <span className="text-sm">Use Apple Music URL</span>
          </div>

          {useAppleMusic && (
            <Card>
              <CardContent>
                <fetcher.Form
                  method="GET"
                  action="/api/apple-music"
                  className="space-y-4"
                >
                  <FormField
                    labelIcon={Globe}
                    label="Apple Music URL"
                    name="appleMusicUrl"
                    placeholder="https://music.apple.com/album/..."
                    value={formData.appleMusicUrl}
                    onChange={handleInputChange}
                  />
                  <Button type="submit" className="w-full">
                    Submit URL
                  </Button>
                </fetcher.Form>
                {fetcher.data && !fetcher.data.error && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Album details found:
                    </p>
                    <p className="font-medium">{fetcher.data.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {fetcher.data.artistName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
            <div className="grid grid-cols-1 gap-3">
              <FormField
                labelIcon={Music}
                label="Album name"
                {...getInputProps(fields.title, { type: "text" })}
                value={formData.title}
                onChange={handleInputChange}
              />
              <FormField
                labelIcon={Calendar}
                label="Release year"
                {...getInputProps(fields.releaseYear, { type: "text" })}
                value={formData.releaseYear}
                onChange={handleInputChange}
              />
              <FormField
                labelIcon={Tag}
                label="Genre"
                {...getInputProps(fields.genre, { type: "text" })}
                value={formData.genre}
                onChange={handleInputChange}
              />
              <FormField
                labelIcon={Globe}
                label="Apple Music URL"
                {...getInputProps(fields.appleMusicUrl, { type: "text" })}
                value={formData.appleMusicUrl}
                onChange={handleInputChange}
              />
              <FormField
                labelIcon={User}
                label="Artist"
                {...getInputProps(fields.artistName, { type: "text" })}
                value={formData.artistName}
                onChange={handleInputChange}
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
