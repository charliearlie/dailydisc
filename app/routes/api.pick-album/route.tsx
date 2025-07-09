import { LoaderFunctionArgs, json } from "@remix-run/node";
import { and, eq, sql, or, isNull, lt } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { albums } from "~/drizzle/schema.server";

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
    // Calculate one year ago from today
    const oneYearAgo = new Date(todaysDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    selectedAlbum = await db.query.albums.findFirst({
      where: or(
        // Never picked albums (priority 1)
        and(eq(albums.archived, 0), isNull(albums.listenDate)),
        // Albums last picked over 1 year ago (priority 2)
        and(eq(albums.archived, 1), lt(albums.lastPickedDate, oneYearAgo))
      ),
      with: {
        artistsToAlbums: {
          columns: {},
          with: {
            artist: true,
          },
        },
      },
      orderBy: [
        // Prioritize never-picked albums (nulls first)
        sql`CASE WHEN ${albums.lastPickedDate} IS NULL THEN 0 ELSE 1 END`,
        sql`RANDOM()`
      ],
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
      lastPickedDate: todaysDate,
      archived: 0, // Reset archived status for re-picked albums
    })
    .where(eq(albums.id, selectedAlbum.id));

  const updatedAlbum = {
    ...selectedAlbum,
    primaryArtist: selectedAlbum.artistsToAlbums[0].artist.name,
  };

  return json({ randomAlbum: updatedAlbum });
};
