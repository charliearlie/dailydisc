import { LoaderFunctionArgs, json } from "@remix-run/node";
import { and, eq, sql } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { albums } from "~/drizzle/schema.server";
import { generateAlbumDescription } from "~/services/claude.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const apiKey = request.headers.get("x-api-key");
  const serverApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== serverApiKey) {
    return json(
      {
        error:
          "You are not authorised to hit this endpoint, please provide a valid API key",
      },
      { status: 403 },
    );
  }

  console.log("Archiving yesterdays album");

  await db
    .update(albums)
    .set({
      active: 0,
      archived: 1,
    })
    .where(eq(albums.active, 1));

  console.log("Picking today's album");

  const todaysDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/London" }),
  );
  todaysDate.setUTCHours(0, 0, 0, 0);

  const scheduledAlbum = await db.query.albums.findFirst({
    where: and(eq(albums.listenDate, todaysDate), eq(albums.archived, 0)),
    with: {
      artistsToAlbums: {
        columns: {},
        with: {
          artist: true,
        },
      },
    },
  });

  let selectedAlbum;

  if (scheduledAlbum) {
    selectedAlbum = scheduledAlbum;
  } else {
    selectedAlbum = await db.query.albums.findFirst({
      where: eq(albums.archived, 0),
      with: {
        artistsToAlbums: {
          columns: {},
          with: {
            artist: true,
          },
        },
      },
      orderBy: sql`RANDOM()`,
    });
  }

  if (!selectedAlbum) {
    return json({ error: "No albums found" }, { status: 404 });
  }

  await db
    .update(albums)
    .set({
      active: 1,
      listenDate: todaysDate,
    })
    .where(eq(albums.id, selectedAlbum.id));

  const updatedAlbum = {
    ...selectedAlbum,
    primaryArtist: selectedAlbum.artistsToAlbums[0].artist.name,
  };

  return json({ randomAlbum: updatedAlbum });
};
