import { writeAsyncIterableToWritable } from "@remix-run/node";
import cloudinary from "cloudinary";

export enum UPLOAD_PRESET_ENUM {
  albumArtwork = "bidhub_listing_thumbnail",
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function* createAsyncIterable(data: Uint8Array) {
  yield data;
}

export async function uploadImages(
  files: File | File[],
  preset: UPLOAD_PRESET_ENUM = UPLOAD_PRESET_ENUM.albumArtwork,
) {
  const filesArray = Array.isArray(files) ? files : [files]; // Ensure files is an array

  if (!filesArray.length) return [];

  const uploadPromises = filesArray.map(async (file) => {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const iterableData = createAsyncIterable(data);

    return new Promise<cloudinary.UploadApiResponse | null>(async (resolve) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "dailydisc",
          upload_preset: preset,
        },
        (error, result) => {
          if (error) {
            console.error("error", error);
            resolve(null);
            return;
          }
          resolve(result || null);
        },
      );

      try {
        await writeAsyncIterableToWritable(iterableData, uploadStream);
      } catch (err) {
        console.error("Error writing to upload stream:", err);
        resolve(null);
      }
    });
  });

  const results = await Promise.all(uploadPromises);

  return results.length > 0
    ? results
        .filter((result) => Boolean(result))
        .map((result) => result?.secure_url)
    : [];
}
