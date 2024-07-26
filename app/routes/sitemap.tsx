import { format } from "date-fns";
import { getAllArchivedAlbumDates } from "~/services/album.server";

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
  const staticRoutes = ["/", "/archive", "/discover"];
  const albumDates = await getAllArchivedAlbumDates();

  const albumRoutes = albumDates.map(
    (listenDate) => `/archive/${format(new Date(listenDate!), "yyyy-MM-dd")}`,
  );

  const allRoutes = [...staticRoutes, ...albumRoutes];

  const sitemap = generateSitemapXml(allRoutes);

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
    "Cache-Control": "public, max-age=3600",
  };
}
