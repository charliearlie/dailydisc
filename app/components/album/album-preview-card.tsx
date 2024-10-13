import { Link } from "@remix-run/react";
import { format } from "date-fns";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardImage,
} from "~/components/common/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/ui/tooltip";
import { Badge } from "../common/ui/badge";
import { ArchiveAlbum } from "~/services/album.server";
import { useUser } from "~/contexts/user-context";
import { useState } from "react";

export const AlbumPreviewCard = ({ album }: { album: ArchiveAlbum }) => {
  const user = useUser();

  const [hoveredAlbum, setHoveredAlbum] = useState<number | null>(null);

  const Artists = ({ artists }: { artists: string[] }) => {
    return (
      <p>
        {artists.map((artist, index) => {
          return (
            <span key={artist}>
              {artist}
              {`${index === artists.length - 1 ? "" : ", "}`}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <Link to={`/archive/${format(new Date(album.listenDate!), "yyyy-MM-dd")}`}>
      <TooltipProvider>
        <Card
          key={album.id}
          className="transform overflow-hidden text-left transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
          onMouseEnter={() => setHoveredAlbum(album.id)}
          onMouseLeave={() => setHoveredAlbum(null)}
        >
          <CardHeader className="relative p-0">
            <div className="relative aspect-square">
              <CardImage
                className="h-full w-full object-cover"
                src={album.image!}
                alt="Album Cover"
              />
              {hoveredAlbum === album.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {album.userRating ? (
                      <>
                        <p className="text-sm text-white">Your rating</p>
                        <div className="flex items-center gap-2 text-white">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span>{album.userRating / 2}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-white">Unreviewed</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Badge className="absolute right-2 top-2 bg-primary font-medium text-primary-foreground shadow-md">
              {format(album.listenDate!, "eee d MMM ''yy")}
            </Badge>
            {album.userRating ? (
              <Badge className="absolute left-2 top-2 bg-secondary text-secondary-foreground shadow-md sm:hidden">
                My rating: {album.userRating / 2}
              </Badge>
            ) : (
              <Badge
                className="absolute left-2 top-2 text-secondary-foreground shadow-md sm:hidden"
                variant="destructive"
              >
                {user.userId ? "Unreviewed" : "Login to review"}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="truncate text-lg font-bold">{album.title}</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{album.title}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-sm text-muted-foreground">
              <Artists artists={album.artists.map((artist) => artist.name)} />
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4 pt-0">
            <span className="text-sm text-muted-foreground">{album.year}</span>
            {album.userRating || user.isUserAdmin ? (
              <div className="flex items-center">
                <span className="mr-1 text-muted-foreground">
                  {album.averageRating}{" "}
                  <span className="text-sm tracking-tighter">
                    ({album.reviewCount})
                  </span>
                </span>
                <Star className="-mt-1 h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </TooltipProvider>
    </Link>
  );
};
