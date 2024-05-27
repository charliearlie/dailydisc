import { LoaderFunctionArgs, json } from "@remix-run/node";
import { spotifyCookie } from "~/services/session";
import { getSpotifyToken } from "~/services/spotify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const tokenData = await getSpotifyToken();

  const response = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=10",
    {
      method: "GET",
      headers: { Authorization: "Bearer " + tokenData.access_token },
    },
  );

  const data = await response.json();

  return json({ data });
};
