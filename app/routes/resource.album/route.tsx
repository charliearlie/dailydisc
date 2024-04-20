import { json } from "@remix-run/node";
import { db } from "~/drizzle/db.server";

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

export const loader = async () => {
  const allAlbums = await db.query.albums.findMany({
    with: {
      artistsToAlbums: {
        with: {
          artist: true,
        },
      },
    },
  });

  return json(shuffleArray(allAlbums));
};
