import { LoaderFunctionArgs, json } from "@remix-run/node";
import { and, eq, sql } from "drizzle-orm";
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

  if (scheduledAlbum) {
    console.log("Todays album is ", scheduledAlbum);
    return json({
      randomAlbum: {
        ...scheduledAlbum,
        primaryArtist: scheduledAlbum.artistsToAlbums[0].artist.name,
      },
    });
  } else {
    const randomAlbum = await db.query.albums.findFirst({
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

    if (randomAlbum) {
      console.log(
        "Todays album is ",
        randomAlbum.artistsToAlbums[0].artist.name,
        randomAlbum.title,
      );
      return json({
        randomAlbum: {
          ...randomAlbum,
          primaryArtist: randomAlbum.artistsToAlbums[0].artist.name,
        },
      });
    }

    return json({ error: "No album found" }, { status: 404 });
  }
};
