import { json, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/drizzle/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || "50");
  const offset = Number(url.searchParams.get("offset") || "0");

  const artists = await db.query.artists.findMany({
    columns: {
      id: true,
      name: true,
    },
    limit,
    offset,
  });

  return json({ artists });
};
