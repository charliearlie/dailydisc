import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  getAlbumDetails,
  getAppleMusicCollectionIdFromUrl,
} from "~/services/itunes.api.server";
import { invariantResponse } from "~/util/utils";

export type AlbumDetailsResponse = {
  title: string;
  artistName: string;
  releaseYear: number;
  genre?: string;
  artwork?: string;
  error?: string;
  collectionId?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const appleMusicUrl = url.searchParams.get("appleMusicUrl");
  console.log("appleMusicUrl", appleMusicUrl);
  invariantResponse(appleMusicUrl, "Apple Music URL is required");

  const collectionId = getAppleMusicCollectionIdFromUrl(appleMusicUrl);

  console.log("collectionId", collectionId);

  if (!collectionId) {
    return json<AlbumDetailsResponse>(
      {
        error: "No collection ID provided",
        title: "",
        artistName: "",
        releaseYear: 0,
      },
      { status: 400 },
    );
  }

  try {
    const albumDetails = await getAlbumDetails(Number(collectionId));
    console.log("albumDetails", albumDetails);
    return json<AlbumDetailsResponse>({ ...albumDetails, collectionId });
  } catch (error) {
    console.error("Error fetching album details:", error);
    return json<AlbumDetailsResponse>(
      {
        error: "Failed to fetch album details",
        title: "",
        artistName: "",
        releaseYear: 0,
      },
      { status: 500 },
    );
  }
}
