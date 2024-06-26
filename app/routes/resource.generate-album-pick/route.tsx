import { LoaderFunctionArgs, json } from "@remix-run/node";
import { eq, sql } from "drizzle-orm";
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

  const [randomAlbum] = await db
    .select()
    .from(albums)
    .where(eq(albums.archived, 1))
    .orderBy(sql.raw("RANDOM()"))
    .limit(1);

  return json({ randomAlbum });
};
