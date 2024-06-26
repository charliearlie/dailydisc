import { desc, eq } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { albums } from "~/drizzle/schema.server";

export const getArchiveAlbums = async (userId?: number) => {
  const archivedAlbums = await db.query.albums.findMany({
    where: eq(albums.archived, 1),
    with: {
      reviews: {
        columns: {
          rating: true,
          userId: true,
        },
      },
      artistsToAlbums: {
        with: {
          artist: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    columns: {
      genre: true,
      id: true,
      image: true,
      listenDate: true,
      title: true,
      year: true,
    },
    orderBy: [desc(albums.listenDate)],
  });

  const albumsWithAverageRating = archivedAlbums.map((album) => {
    const totalRating = album.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );

    const averageRating = totalRating / album.reviews.length / 2;

    const usersRating =
      album.reviews.find((review) => review.userId === userId)?.rating || null;

    return {
      ...album,
      averageRating: isNaN(averageRating) ? "" : averageRating.toFixed(1),
      usersRating: usersRating ? usersRating / 2 : null,
    };
  });

  return albumsWithAverageRating;
};
