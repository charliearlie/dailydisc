import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/common/ui/avatar";
import { Badge } from "~/components/common/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from "~/components/common/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  TooltipProps,
} from "recharts";
import { getUserFromRequestContext } from "~/services/session";
import { getUserByUsername } from "~/services/user.server";
import { invariantResponse } from "~/util/utils";
import { Music, Star, User, UserPlus } from "lucide-react";
import { Button } from "~/components/common/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/ui/dialog";
import { Label } from "~/components/common/ui/label";
import { Input } from "~/components/common/ui/input";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/ui/accordion";
import { db } from "~/drizzle/db.server";
import { albums, reviews } from "~/drizzle/schema.server";
import { desc, eq, inArray } from "drizzle-orm";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/ui/tooltip";

// Optimized review fetching function that gets reviews with aggregation
async function getReviewsWithAggregation(userId: string) {
  // Get reviews with their counts grouped by rating
  const reviewsData = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      albumId: reviews.albumId,
    })
    .from(reviews)
    .where(eq(reviews.userId, Number(userId)))
    .orderBy(desc(reviews.rating));

  // Calculate aggregation in memory (since we need the full review data anyway)
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

// Optimized album fetching that gets only required fields
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

  // Get both users in parallel
  const [loggedInUser, profileUser] = await Promise.all([
    getUserFromRequestContext(request),
    getUserByUsername(params.username),
  ]);

  invariantResponse(profileUser, "User not found");

  // Get reviews data with optimized query
  const { reviews, reviewsSummary, totalCount } =
    await getReviewsWithAggregation(`${profileUser.id}`);

  // Get top rated albums (limited to 8)
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
        // Cache for 5 minutes, allow serving stale data for up to 1 week while revalidating
        "Cache-Control": "public, max-age=300, stale-while-revalidate=604800",
      },
    },
  );
};

export default function ProfileRoute() {
  const { loggedInUser, reviewCount, reviewsSummary, topRatedAlbums, user } =
    useLoaderData<typeof loader>();

  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (data: any) => {
    setSelectedRating(data.rating);
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
    <main className="container mx-auto max-w-4xl space-y-8 py-8 md:py-16 lg:max-w-screen-lg">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-primary-foreground" />
        <CardContent className="relative px-4 pb-8 pt-16 sm:px-6 lg:px-8">
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 cursor-pointer border-4 border-background">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}&chars=1`}
                  alt={user.username}
                />
                <AvatarFallback>
                  {user.username.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Avatar</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatar-url" className="text-right">
                    Avatar URL
                  </Label>
                  <Input id="avatar-url" value="" className="col-span-3" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="mt-1 text-muted-foreground">{reviewCount} reviews</p>
          </div>
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">Favourite genres</h3>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Hip-Hop
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Rock
              </Badge>
            </div>
          </div>
          {!isOwnProfile && (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => alert("This doesn't work yet")}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reviewsSummary} onClick={handleBarClick}>
              <XAxis dataKey="rating" />
              <YAxis />
              <RechartTooltip cursor={false} content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedRating !== null && (
        <Accordion type="single" collapsible defaultValue="albums">
          <AccordionItem value="albums">
            <AccordionTrigger>Albums rated {selectedRating}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6">
                {/* {albumsByRating[selectedRating]?.map((album, index) => (
                  <li key={index}>
                    {album.title} by {album.artist}
                  </li>
                ))} */}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Highest Rated Albums</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {topRatedAlbums.map((album, index) => (
              <li key={index}>
                <Link
                  to={`/archive/${format(new Date(album.listenDate!), "yyyy-MM-dd")}`}
                >
                  <TooltipProvider>
                    <Card
                      key={album.id}
                      className="transform overflow-hidden text-left transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
                    >
                      <CardHeader className="relative p-0">
                        <div className="relative aspect-square">
                          <CardImage
                            className="h-full w-full object-cover"
                            src={album.image!}
                            alt="Album Cover"
                          />
                        </div>
                        <Badge className="absolute right-2 top-2 bg-primary font-medium text-primary-foreground shadow-md">
                          {format(album.listenDate!, "eee d MMM ''yy")}
                        </Badge>

                        <Badge className="absolute left-2 top-2 bg-secondary text-secondary-foreground shadow-md sm:hidden">
                          My rating: 10
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="truncate text-lg font-bold">
                              {album.title}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{album.title}</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-sm text-muted-foreground">
                          {album.artistsToAlbums.map((artist, index) => (
                            <span key={artist.artistId}>
                              {artist.artist.name}
                              {`${index === album.artistsToAlbums.length - 1 ? "" : ", "}`}
                            </span>
                          ))}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between p-4 pt-0">
                        <span className="text-sm text-muted-foreground">
                          {album.year}
                        </span>

                        <div className="flex items-center">
                          <span className="mr-1 text-muted-foreground">10</span>
                          <Star className="-mt-1 h-6 w-6 fill-yellow-400 text-yellow-400" />
                        </div>
                      </CardFooter>
                    </Card>
                  </TooltipProvider>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Username:</span> {user.username}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Profile Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={isOwnProfile ? "text-green-600" : "text-blue-600"}>
            {isOwnProfile
              ? "You are viewing your own profile"
              : "You are viewing someone else's profile"}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
