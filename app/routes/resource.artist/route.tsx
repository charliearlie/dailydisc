import { json } from "@remix-run/node";
import { db } from "~/drizzle/db.server";
import { artists } from "~/drizzle/schema.server";

export const loader = async () => {
  const artistsArray = await db.select().from(artists);

  return json(artistsArray.sort((a, b) => a.name.localeCompare(b.name)));
};
