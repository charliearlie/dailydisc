import { count, desc, eq, notInArray, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db.server";
import {
  albums,
  artists,
  artistsToAlbums,
  reviews,
} from "~/drizzle/schema.server";

type GetArchiveAlbumsOptions = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  userId?: number;
};

type Artist = {
  name: string;
};

export type ArchiveAlbum = {
  id: number;
  title: string;
  genre: string | null;
  image: string | null;
  year: string;
  listenDate: string | null;
  averageRating: number | null;
  artists: Artist[];
  userRating: number | null;
  reviewCount: number;
};

export const getArchiveAlbums = async ({
  limit = 16,
  offset = 0,
  orderBy,
  userId,
}: GetArchiveAlbumsOptions = {}): Promise<ArchiveAlbum[]> => {
  let orderByClause: SQL<unknown>;

  switch (orderBy) {
    case "averageRating":
      orderByClause = sql`${albums.averageRating} DESC`;
      break;
    case "userRating":
      if (userId) {
        orderByClause = sql`userRating DESC NULLS LAST`;
      } else {
        orderByClause = sql`${albums.listenDate} DESC`;
      }
      break;
    default:
      orderByClause = sql`${albums.listenDate} DESC`;
  }

  const query = db
    .select({
      id: albums.id,
      title: albums.title,
      genre: albums.genre,
      image: albums.image,
      year: albums.year,
      listenDate: albums.listenDate,
      averageRating: albums.averageRating,
      artists:
        sql<string>`json_group_array(DISTINCT json_object('name', ${artists.name}))`.as(
          "artists",
        ),
      userRating: userId
        ? sql<number | null>`(
            SELECT rating 
            FROM ${reviews}
            WHERE ${reviews.albumId} = ${albums.id} 
              AND ${reviews.userId} = ${userId}
          )`.as("userRating")
        : sql<null>`NULL`.as("userRating"),
      reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`.as("reviewCount"),
    })
    .from(albums)
    .leftJoin(artistsToAlbums, eq(albums.id, artistsToAlbums.albumId))
    .leftJoin(artists, eq(artistsToAlbums.artistId, artists.id))
    .leftJoin(reviews, eq(albums.id, reviews.albumId))
    .where(eq(albums.archived, 1))
    .groupBy(albums.id)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const rawArchivedAlbums = await query;

  const archivedAlbums: ArchiveAlbum[] = rawArchivedAlbums.map((album) => ({
    ...album,
    listenDate: album.listenDate as string | null,
    artists: JSON.parse(album.artists as string) as Artist[],
    userRating: album.userRating as number | null,
    reviewCount: Number(album.reviewCount), // Ensure reviewCount is a number
  }));

  return archivedAlbums;
};

export const getArchivedAlbumCount = async () => {
  const [response] = await db
    .select({ count: count() })
    .from(albums)
    .where(eq(albums.archived, 1));

  return response.count;
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
