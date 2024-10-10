// import { db } from "~/drizzle/db.server";

export const loader = async () => {
  // const latestSitemap = await db.query.sitemaps.findFirst({
  //   orderBy: (sitemaps, { desc }) => [desc(sitemaps.updatedAt)],
  // });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

    <url>
      <loc>https://www.dailydisc.club/</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/discover</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-09</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-16</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-20</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-02</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-28</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-05</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-29</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-23</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-04</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-26</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-25</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-25</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-03</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-01</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-22</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-12</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-10</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-16</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-11</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-29</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-23</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-19</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-03</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-23</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-12</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-08</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-24</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-27</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-11</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-15</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-01</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-26</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-19</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-23</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-04</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-22</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-30</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-28</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-07</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-28</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-13</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-08</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-07</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-29</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-10</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-18</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-21</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-10</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-06</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-20</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-24</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-09</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-26</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-24</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-18</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-21</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-08</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-23</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-03</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-30</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-27</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-17</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-06</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-13</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-06</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-28</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-21</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-25</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-09</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-30</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-17</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-24</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-21</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-06</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-27</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-01</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-28</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-02</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-01</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-15</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-26</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-17</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-04</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-16</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-14</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-18</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-26</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-02</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-15</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-01</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-02</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-02</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-08</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-22</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-14</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-05</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-26</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-30</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-03</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-17</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-27</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-07</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-30</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-25</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-31</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-04</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-07</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-05</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-31</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-15</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-14</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-10</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-14</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-20</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-04</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-04-25</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-07</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-20</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-03</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-17</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-13</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-10</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-05</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-01</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-03</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-09</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-05</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-24</loc>
      <lastmod>2024-10-08T18:56:40.940Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-19</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-12</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-09</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-18</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-19</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-29</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-10-06</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-30</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-02</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-21</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-05</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-05-11</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-16</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-29</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-29</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-13</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-11</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-06-12</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-27</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-04</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-07</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-22</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-13</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-27</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-08</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-18</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-25</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-16</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-14</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-22</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-08-23</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-11</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-31</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-22</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-28</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-19</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-12</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-07-24</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-06</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

    <url>
      <loc>https://www.dailydisc.club/archive/2024-09-20</loc>
      <lastmod>2024-10-08T18:56:40.944Z</lastmod>
    </url>

  </urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
        "xml-version": "1.0",
        encoding: "UTF-8",
      },
    },
  );

  // Put the following in its own route

  //   const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

  // async function getAllArchivedAlbumDates() {
  //   const archivedDates = await db
  //     .select({ listenDate: albums.listenDate })
  //     .from(albums)
  //     .where(eq(albums.archived, 1));

  //   return archivedDates
  //     .map((album) => album.listenDate)
  //     .filter((date) => date !== null);
  // }

  // function generateSitemapXml(routes: string[]) {
  //   const baseUrl = "https://www.dailydisc.club";

  //   const xml = `<?xml version="1.0" encoding="UTF-8"?>
  //   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  //   ${routes
  //     .map(
  //       (route) => `
  //     <url>
  //       <loc>${baseUrl}${route}</loc>
  //       <lastmod>${new Date().toISOString()}</lastmod>
  //     </url>
  //   `,
  //     )
  //     .join("")}
  //   </urlset>`;

  //   return xml.trim();
  // }

  // const staticRoutes = ["/", "/archive", "/discover"];
  // const albumDates = await getAllArchivedAlbumDates();

  // const albumRoutes = albumDates.map(
  //   (listenDate) => `/archive/${format(new Date(listenDate), "yyyy-MM-dd")}`,
  // );

  // const allRoutes = [...staticRoutes, ...albumRoutes];
  // const sitemap = generateSitemapXml(allRoutes);

  // // Save the new sitemap using SQL default for updatedAt
  // await db.insert(sitemaps).values({
  //   content: sitemap,
  // });

  // // Clean up old sitemaps (keep only the latest one)
  // if (latestSitemap) {
  //   await db.delete(sitemaps).where(sql`id != ${latestSitemap.id}`);
  // }

  // return new Response(sitemap, {
  //   headers: {
  //     "Content-Type": "application/xml",
  //     "xml-version": "1.0",
  //     encoding: "UTF-8",
  //   },
  // });
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=86400", // 24 hours
  };
}
