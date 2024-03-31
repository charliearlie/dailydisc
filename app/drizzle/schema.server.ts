import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  primaryKey,
} from "drizzle-orm/sqlite-core";

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
  })
);

export const albumsRelations = relations(albums, ({ many }) => ({
  artistsToAlbums: many(artistsToAlbums),
}));

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
  })
);
