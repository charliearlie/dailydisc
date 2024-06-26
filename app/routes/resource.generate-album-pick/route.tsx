import { json } from "@remix-run/node";
import { eq, sql } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { albums } from "~/drizzle/schema.server";

export const loader = async () => {
  const [randomAlbum] = await db
    .select()
    .from(albums)
    .where(eq(albums.archived, 1))
    .orderBy(sql.raw("RANDOM()"))
    .limit(1);

  return json({ randomAlbum });
};
