import { artists } from "~/drizzle/schema.server";
import { SpotifyAlbum } from "~/util/types/spotify/spotify-response-types";

export const getSpotifyToken = async (): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
}> => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  return response.json();
};
