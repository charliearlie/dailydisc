import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { searchAlbums } from "~/services/music-services/spotify.server";
import { invariantResponse } from "~/util/utils";

export const loader = async ({ request }: DataFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  invariantResponse(query, "Query is required");

  const searchResults = await searchAlbums(query);

  return json(searchResults);
};
