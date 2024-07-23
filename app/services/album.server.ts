import { desc, eq, notInArray } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import { albums, artists } from "~/drizzle/schema.server";

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

export const getDailyAlbumDate = async (spotifyId: string) => {
  const album = await db.query.albums.findFirst({
    where: eq(albums.spotifyUrl, spotifyId),
  });

  return album?.listenDate;
};

export const getAllAlbums = async (userId?: number) => {
  const archivedAlbums = await db.query.albums.findMany({
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
      spotifyUrl: true,
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

export const getAllArchivedAlbumDates = async () => {
  const archivedAlbums = await db.query.albums.findMany({
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
      spotifyUrl: true,
      title: true,
      year: true,
    },
    orderBy: [desc(albums.listenDate)],
    where: eq(albums.archived, 1),
  });

  return archivedAlbums.map((album) => album.listenDate);
};

export const getAllArtists = async () => {
  const artistIdsWithAlbums = await db.query.artistsToAlbums.findMany({
    columns: {
      artistId: true,
    },
  });

  // Step 2: Extract the artist IDs
  const artistIds = artistIdsWithAlbums.map((record) => record.artistId);

  // Step 3: Query artists table for those not in the list of artist IDs with albums
  const artistsWithoutAlbums = await db.query.artists.findMany({
    where: notInArray(artists.id, artistIds),
    columns: {
      id: true,
      image: true,
      name: true,
    },
  });

  return artistsWithoutAlbums;
};
