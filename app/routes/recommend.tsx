import { useState } from "react";
import { ActionFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { openai } from "~/services/openai.server";
import { searchAlbums } from "~/services/music-services/spotify.server";
import { getAlbumTracks } from "~/services/itunes.api.server";

import { Button } from "~/components/common/ui/button";
import { Card, CardContent } from "~/components/common/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/common/ui/tabs";
import { Badge } from "~/components/common/ui/badge";
import { format } from "date-fns";

type Track = {
  id: number;
  title: string;
  artist: string;
  trackNumber: number;
  trackTimeMillis: number;
};

type Album = {
  name: string;
  image: string;
  artists: Array<{ id: string; name: string }>;
  releaseDate: string;
  totalTracks: number;
  description: string;
  tracks: Track[];
};

type ActionData =
  | { type: "error"; message: string }
  | { type: "success"; album: Album };

type RecommendationResponse = {
  artistName: string;
  albumName: string;
  year: number;
  description: string;
};

export const meta: MetaFunction = () => {
  return [
    { title: "AI Album Recommendations - Daily Disc" },
    {
      name: "description",
      content: "Get personalized album recommendations powered by AI",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const promptValue = formData.get("prompt");

  if (!promptValue || typeof promptValue !== "string") {
    return json<ActionData>({
      type: "error",
      message: "Please provide a prompt",
    });
  }

  try {
    // Get album recommendation from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable music expert. When given a description or request for music, recommend ONE specific album that best matches the request. Format your response as JSON with the following fields: artistName, albumName, year, description. Keep the description brief (2-3 sentences).",
        },
        {
          role: "user",
          content: promptValue as string,
        },
      ] as const,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const recommendation = JSON.parse(content) as RecommendationResponse;

    // Search for the album on Spotify
    const searchQuery = `${recommendation.albumName} ${recommendation.artistName}`;
    const albums = await searchAlbums(searchQuery);

    if (albums.length === 0) {
      return json<ActionData>({ type: "error", message: "Album not found" });
    }

    const album = albums[0];

    // Get tracks from iTunes
    const rawTracks = await getAlbumTracks(Number(album.id));

    // Transform tracks to match our type
    const tracks: Track[] = rawTracks
      .filter(
        (
          track,
        ): track is NonNullable<typeof track> & {
          id: number;
          title: string;
          artist: string;
          trackNumber: number;
          trackTimeMillis: number;
        } =>
          typeof track.id === "number" &&
          typeof track.title === "string" &&
          typeof track.artist === "string" &&
          typeof track.trackNumber === "number" &&
          typeof track.trackTimeMillis === "number",
      )
      .map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        trackNumber: track.trackNumber,
        trackTimeMillis: track.trackTimeMillis,
      }));

    return json<ActionData>({
      type: "success",
      album: {
        ...album,
        description: recommendation.description,
        tracks,
      },
    });
  } catch (error) {
    console.error("Error getting recommendation:", error);
    return json<ActionData>({
      type: "error",
      message: "Failed to get recommendation",
    });
  }
};

export default function Recommend() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState("");

  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/15">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            AI Album <span className="text-primary">Recommendations</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Describe the type of music you're in the mood for, and let AI
            suggest the perfect album.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Form method="post" className="mb-8">
            <div className="flex flex-col gap-4">
              <textarea
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] w-full rounded-lg border border-border bg-background p-4 text-foreground"
                placeholder="e.g., 'I want something energetic and upbeat from the 80s' or 'Looking for a melancholic jazz album perfect for rainy days'"
              />
              <Button
                type="submit"
                className="ml-auto"
                disabled={isSubmitting || !prompt}
              >
                {isSubmitting
                  ? "Getting recommendation..."
                  : "Get Recommendation"}
              </Button>
            </div>
          </Form>

          {actionData?.type === "error" && (
            <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {actionData.message}
            </div>
          )}

          {actionData?.type === "success" && (
            <div className="mb-8 grid items-center gap-8 md:grid-cols-5">
              <div className="relative flex justify-center md:col-span-2">
                <div className="group relative max-w-[400px]">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary via-primary/50 to-primary/20 opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
                  <div className="relative">
                    <img
                      src={actionData.album.image}
                      alt={actionData.album.name}
                      className="relative rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-6 p-4 md:col-span-3">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {actionData.album.name}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {actionData.album.artists.map((artist) => (
                      <span
                        key={artist.id}
                        className="rounded-full bg-card px-4 py-2 font-medium"
                      >
                        {artist.name}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground">
                  {actionData.album.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="text-sm">
                    {new Date(actionData.album.releaseDate).getFullYear()}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary-foreground">
                    {actionData.album.totalTracks} tracks
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {actionData?.type === "success" && actionData.album.tracks && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Track List</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {actionData.album.tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 p-3 transition-colors hover:bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {track.trackNumber}
                        </span>
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(track.trackTimeMillis), "mm:ss")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
