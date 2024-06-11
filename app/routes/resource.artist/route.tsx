import { json } from "@remix-run/node";
import { getSpotifyToken } from "~/services/spotify.server";

export const config = { runtime: "edge" };

export const loader = async () => {
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
