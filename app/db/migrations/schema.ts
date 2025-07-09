import { sqliteTable, AnySQLiteColumn, uniqueIndex, integer, text, foreignKey, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const artists = sqliteTable("artists", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	name: text("name").notNull(),
	bio: text("bio"),
	image: text("image"),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
},
(table) => {
	return {
		name_unique: uniqueIndex("artists_name_unique").on(table.name),
	}
});

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	username: text("username").notNull(),
	email: text("email").notNull(),
	password: text("password").notNull(),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
},
(table) => {
	return {
		email_unique: uniqueIndex("users_email_unique").on(table.email),
		username_unique: uniqueIndex("users_username_unique").on(table.username),
	}
});

export const albums = sqliteTable("albums", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	title: text("title").notNull(),
	genre: text("genre"),
	image: text("image"),
	year: text("year").notNull(),
	apple_music_url: text("apple_music_url"),
	apple_music_collection_id: text("apple_music_collection_id"),
	spotify_url: text("spotify_url"),
	listen_date: integer("listen_date"),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
	active: integer("active").default(0).notNull(),
	archived: integer("archived").default(0).notNull(),
	description: text("description"),
	averageRating: integer("averageRating"),
	average_rating: integer("average_rating"),
});

export const reviews = sqliteTable("reviews", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	album_id: integer("album_id").notNull().references(() => albums.id),
	user_id: integer("user_id").notNull().references(() => users.id),
	rating: integer("rating").notNull(),
	review: text("review"),
	favourite_track: text("favourite_track"),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const artists_to_albums = sqliteTable("artists_to_albums", {
	artist_id: integer("artist_id").notNull().references(() => artists.id),
	album_id: integer("album_id").notNull().references(() => albums.id),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.album_id, table.artist_id], name: "artists_to_albums_album_id_artist_id_pk"})
	}
});

export const sitemaps = sqliteTable("sitemaps", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	content: text("content").notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
});