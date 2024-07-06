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
    where: eq(albums.title, "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?"),
  });

  if (scheduledAlbum) {
    console.log("Todays album is ", scheduledAlbum.title);

    return json({ randomAlbum: scheduledAlbum });
  } else {
    const [randomAlbum] = await db
      .select()
      .from(albums)
      .where(eq(albums.title, "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?"))
      .orderBy(sql.raw("RANDOM()"))
      .limit(1);

    console.log("Todays album is ", randomAlbum.title);

    return json({ randomAlbum });
  }
};
