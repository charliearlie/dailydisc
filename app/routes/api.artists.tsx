import { json } from "@remix-run/node";
import { db } from "~/drizzle/db.server";

export const loader = async () => {
  const artists = await db.query.artists.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return json({ artists });
};
