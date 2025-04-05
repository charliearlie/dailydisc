import { useState } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { desc, eq, inArray } from "drizzle-orm";
import { Music, Star, User, UserPlus } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  TooltipProps,
} from "recharts";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/common/ui/avatar";
import { Badge } from "~/components/common/ui/badge";
import { Button } from "~/components/common/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/common/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/ui/dialog";
import { Input } from "~/components/common/ui/input";
import { Label } from "~/components/common/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/ui/tooltip";
import { db } from "~/drizzle/db.server";
import { albums, reviews } from "~/drizzle/schema.server";
import { getUserFromRequestContext } from "~/services/session";
import { getUserByUsername } from "~/services/user.server";
import { invariantResponse } from "~/util/utils";

async function getReviewsWithAggregation(userId: string) {
  const reviewsData = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      albumId: reviews.albumId,
    })
    .from(reviews)
    .where(eq(reviews.userId, Number(userId)))
    .orderBy(desc(reviews.rating));

  const aggregated = reviewsData.reduce<Record<number, number>>(
    (acc, review) => {
      const actualRating = review.rating / 2;
      acc[actualRating] = (acc[actualRating] || 0) + 1;
      return acc;
    },
    {},
  );

  const allRatings = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5);
  const reviewsSummary = allRatings.map((rating) => ({
    rating,
    count: aggregated[rating] || 0,
  }));

  return {
    reviews: reviewsData,
    reviewsSummary,
    totalCount: reviewsData.length,
  };
}

async function getTopRatedAlbums(albumIds: number[]) {
  return db.query.albums.findMany({
    where: inArray(albums.id, albumIds),
    with: {
      artistsToAlbums: {
        with: {
          artist: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    columns: {
      id: true,
      title: true,
      image: true,
      year: true,
      listenDate: true,
    },
  });
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariantResponse(params.username, "Expected params.username");

  const [loggedInUser, profileUser] = await Promise.all([
    getUserFromRequestContext(request),
    getUserByUsername(params.username),
  ]);

  invariantResponse(profileUser, "User not found");

  const { reviews, reviewsSummary, totalCount } =
    await getReviewsWithAggregation(`${profileUser.id}`);

  const topRatedAlbumIds = reviews.slice(0, 8).map((review) => review.albumId);

  const topRatedAlbums = await getTopRatedAlbums(topRatedAlbumIds);

  return json(
    {
      loggedInUser: {
        username: loggedInUser?.username,
        email: loggedInUser?.email,
      },
      reviewCount: totalCount,
      reviewsSummary,
      topRatedAlbums,
      user: { username: profileUser.username, email: profileUser.email },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=604800",
      },
    },
  );
};

export default function ProfileRoute() {
  const { loggedInUser, reviewCount, reviewsSummary, topRatedAlbums, user } =
    useLoaderData<typeof loader>();

  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // For the chart's onClick handler with the appropriate typing
  const handleBarClick = (
    _: unknown,
    event: { activePayload?: Array<{ payload: { rating: number } }> },
  ) => {
    if (event.activePayload && event.activePayload.length > 0) {
      setSelectedRating(event.activePayload[0].payload.rating);
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border border-border bg-background p-2 shadow-md">
          <p className="font-semibold">{`${label} stars`}</p>
          <p>{`${payload[0].value} ${payload[0].value === 1 ? "review" : "reviews"}`}</p>
        </div>
      );
    }

    return null;
  };

  const isOwnProfile = loggedInUser.username === user.username;

  return (
    <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/15">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <Card className="relative mb-12 overflow-hidden border-primary/20 shadow-lg">
          <div className="h-48 bg-gradient-to-r from-primary/80 to-primary/20"></div>
          <CardContent className="relative px-4 pb-8 pt-16 sm:px-6 lg:px-8">
            <Dialog>
              <DialogTrigger asChild>
                <div className="group absolute -top-24 left-1/2 -translate-x-1/2 transform md:left-8 md:translate-x-0">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-primary/50 to-primary/20 opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
                  <Avatar className="relative h-48 w-48 cursor-pointer border-4 border-background shadow-xl transition-transform duration-300 hover:scale-105">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}&accessories=headphones`}
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-primary/10 text-4xl">
                      {user.username.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customize Your Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="avatar-url" className="text-right">
                      Avatar URL
                    </Label>
                    <Input id="avatar-url" value="" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={user.username}
                      className="col-span-3"
                      disabled
                    />
                  </div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground">
                  Save Changes
                </Button>
              </DialogContent>
            </Dialog>

            <div className="mt-6 flex flex-col items-center text-center md:ml-48 md:items-start md:text-left">
              <div className="flex items-center space-x-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  {user.username}
                </h1>
                <Badge
                  variant="outline"
                  className="ml-2 border-primary/30 text-primary"
                >
                  Music Enthusiast
                </Badge>
              </div>
              <div className="mt-2 flex items-center space-x-2 text-muted-foreground">
                <Music className="h-4 w-4" />
                <span>{reviewCount} reviews</span>
                <span className="text-xl">•</span>
                <span>Joined April 2024</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center rounded-lg bg-card/80 p-3 shadow-sm">
                  <Star className="mb-1 h-5 w-5 text-amber-500" />
                  <span className="text-xl font-bold">
                    {reviewsSummary.reduce((sum, item) => sum + item.count, 0)}
                  </span>
                  <span className="text-xs text-muted-foreground">Reviews</span>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-card/80 p-3 shadow-sm">
                  <Music className="mb-1 h-5 w-5 text-primary" />
                  <span className="text-xl font-bold">
                    {topRatedAlbums.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Favorites
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-card/80 p-3 shadow-sm">
                  <User className="mb-1 h-5 w-5 text-indigo-500" />
                  <span className="text-xl font-bold">0</span>
                  <span className="text-xs text-muted-foreground">Friends</span>
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="absolute right-6 top-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="rounded-full bg-primary/80 p-3 backdrop-blur-sm"
                        variant="outline"
                        onClick={() => alert("This feature is coming soon!")}
                      >
                        <UserPlus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Friend</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card className="overflow-hidden border-primary/20 shadow-md">
              <CardHeader className="bg-card/80 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-amber-500" />
                  Favorite Genres
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-sm"
                  >
                    Hip-Hop
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-sm"
                  >
                    Rock
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-sm"
                  >
                    Jazz
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-sm"
                  >
                    Electronic
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-sm"
                  >
                    Indie
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 overflow-hidden border-primary/20 shadow-md">
              <CardHeader className="bg-card/80 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Music className="h-5 w-5 text-primary" />
                  Music Taste
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Soul</span>
                      <span>87%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[87%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Jazz</span>
                      <span>64%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[64%] rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Hip-Hop</span>
                      <span>92%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[92%] rounded-full bg-indigo-500"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="overflow-hidden border-primary/20 shadow-md">
              <CardHeader className="bg-card/80 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  Rating Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reviewsSummary} onClick={handleBarClick}>
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <RechartTooltip
                      cursor={false}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="count"
                      name="Reviews"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {selectedRating && (
                  <div className="mt-4 rounded-md bg-muted/50 p-3 text-center">
                    <p className="text-sm">
                      You&apos;ve rated{" "}
                      <span className="font-medium">{selectedRating}</span>{" "}
                      stars{" "}
                      <span className="font-medium">
                        {reviewsSummary.find((r) => r.rating === selectedRating)
                          ?.count || 0}
                      </span>{" "}
                      times
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 overflow-hidden border-primary/20 shadow-md">
              <CardHeader className="bg-card/80 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  Top Rated Albums
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {topRatedAlbums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/album/${album.id}`}
                      className="group block overflow-hidden rounded-lg border border-border/40 bg-card/50 shadow-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-md"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                          <img
                            src={album.image || "https://placehold.co/400x400"}
                            alt={album.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="line-clamp-1 font-medium">
                            {album.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {album.artistsToAlbums[0]?.artist.name}
                          </p>
                          <div className="mt-1 flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-3 w-3 fill-amber-500 text-amber-500"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-card/50 px-4 py-3">
                <Link
                  to="/archive"
                  className="inline-flex w-full items-center justify-center text-sm font-medium text-primary"
                >
                  View all albums
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1 h-4 w-4"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
