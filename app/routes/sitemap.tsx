import { format } from "date-fns";
import { db } from "~/drizzle/db.server";
import { albums, sitemaps } from "~/drizzle/schema.server";
import { eq, sql } from "drizzle-orm";

const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

async function getAllArchivedAlbumDates() {
  const archivedDates = await db
    .select({ listenDate: albums.listenDate })
    .from(albums)
    .where(eq(albums.archived, 1));

  return archivedDates
    .map((album) => album.listenDate)
    .filter((date) => date !== null);
}

function generateSitemapXml(routes: string[]) {
  const baseUrl = "https://www.dailydisc.club";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
  `,
    )
    .join("")}
  </urlset>`;

  return xml.trim();
}

export const loader = async () => {
  // Get the latest sitemap
  const latestSitemap = await db.query.sitemaps.findFirst({
    orderBy: (sitemaps, { desc }) => [desc(sitemaps.updatedAt)],
  });

  // Convert the current timestamp to seconds since epoch
  const nowInSeconds = Math.floor(Date.now() / 1000);

  // If sitemap exists and is less than 24 hours old, return it
  if (
    latestSitemap &&
    nowInSeconds - Number(latestSitemap.updatedAt) < CACHE_DURATION
  ) {
    return new Response(latestSitemap.content, {
      headers: {
        "Content-Type": "application/xml",
        "xml-version": "1.0",
        encoding: "UTF-8",
      },
    });
  }

  // Otherwise, generate new sitemap
  const staticRoutes = ["/", "/archive", "/discover"];
  const albumDates = await getAllArchivedAlbumDates();

  const albumRoutes = albumDates.map(
    (listenDate) => `/archive/${format(new Date(listenDate), "yyyy-MM-dd")}`,
  );

  const allRoutes = [...staticRoutes, ...albumRoutes];
  const sitemap = generateSitemapXml(allRoutes);

  // Save the new sitemap using SQL default for updatedAt
  await db.insert(sitemaps).values({
    content: sitemap,
  });

  // Clean up old sitemaps (keep only the latest one)
  if (latestSitemap) {
    await db.delete(sitemaps).where(sql`id != ${latestSitemap.id}`);
  }

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=86400", // 24 hours
  };
}
