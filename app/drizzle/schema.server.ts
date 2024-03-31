import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  primaryKey,
} from "drizzle-orm/sqlite-core";

/**
 * User definition and relationships
 */
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Album definition and relationships
 */
export const albums = sqliteTable("albums", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  genre: text("genre"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const albumsRelations = relations(albums, ({ many }) => ({
  artistsToAlbums: many(artistsToAlbums),
  reviews: many(reviews),
}));

/**
 * Artist definition and relationships
 */

export const artists = sqliteTable("artists", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  bio: text("bio"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const artistsToAlbums = sqliteTable(
  "artists_to_albums",
  {
    artistId: integer("artist_id", { mode: "number" })
      .notNull()
      .references(() => artists.id),
    albumId: integer("album_id", { mode: "number" })
      .notNull()
      .references(() => albums.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.artistId, t.albumId] }),
  }),
);

export const artistsRelations = relations(artists, ({ many }) => ({
  artistsToAlbums: many(artistsToAlbums),
}));

export const artistsToAlbumsRelations = relations(
  artistsToAlbums,
  ({ one }) => ({
    artist: one(artists, {
      fields: [artistsToAlbums.artistId],
      references: [artists.id],
    }),
    album: one(albums, {
      fields: [artistsToAlbums.albumId],
      references: [albums.id],
    }),
  }),
);

/**
 * Review definition and relationships
 */
export const reviews = sqliteTable("reviews", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  albumId: integer("album_id", { mode: "number" })
    .notNull()
    .references(() => albums.id),
  userId: integer("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  favouriteTrack: text("favourite_track"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  album: one(albums, {
    fields: [reviews.albumId],
    references: [albums.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));
