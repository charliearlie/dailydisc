import { relations } from "drizzle-orm/relations";
import { users, reviews, albums, artists_to_albums, artists } from "./schema";

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.user_id],
		references: [users.id]
	}),
	album: one(albums, {
		fields: [reviews.album_id],
		references: [albums.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	reviews: many(reviews),
}));

export const albumsRelations = relations(albums, ({many}) => ({
	reviews: many(reviews),
	artists_to_albums: many(artists_to_albums),
}));

export const artists_to_albumsRelations = relations(artists_to_albums, ({one}) => ({
	album: one(albums, {
		fields: [artists_to_albums.album_id],
		references: [albums.id]
	}),
	artist: one(artists, {
		fields: [artists_to_albums.artist_id],
		references: [artists.id]
	}),
}));

export const artistsRelations = relations(artists, ({many}) => ({
	artists_to_albums: many(artists_to_albums),
}));