import { Link } from "@remix-run/react";
import { format } from "date-fns";
import { CalendarDays, Headphones, Star } from "lucide-react";
import { ArchiveAlbum } from "~/services/album.server";
import { useUser } from "~/contexts/user-context";
import { Badge } from "../common/ui/badge";
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

export const AlbumPreviewCard = ({ album }: { album: ArchiveAlbum }) => {
  const user = useUser();

  const formatArtists = (artists: string[]) => {
    if (artists.length === 0) return "";
    if (artists.length === 1) return artists[0];
    if (artists.length === 2) return `${artists[0]} & ${artists[1]}`;
    return `${artists[0]} & ${artists.length - 1} more`;
  };

  const formattedDate = format(album.listenDate!, "eee d MMM ''yy");
  const isReviewed = !!album.userRating;

  return (
    <Link to={`/archive/${format(new Date(album.listenDate!), "yyyy-MM-dd")}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="relative p-0">
          <div className="relative">
            <div className="overflow-hidden">
              <CardImage
                className="aspect-square h-full w-full transform object-cover transition-transform duration-700 group-hover:scale-110"
                src={album.image!}
                alt={`${album.title} album cover`}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {isReviewed ? (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Star className="h-3.5 w-3.5 fill-white" />
                <span className="text-xs font-medium">
                  {(album.userRating || 0) / 2}
                </span>
              </div>
            ) : (
              user.userId && (
                <div className="absolute bottom-3 left-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Not rated
                </div>
              )
            )}

            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <CalendarDays className="h-3 w-3" />
              {formattedDate}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="line-clamp-1 text-lg font-bold leading-tight group-hover:text-primary">
                  {album.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{album.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {formatArtists(album.artists.map((artist) => artist.name))}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/30 p-4 pt-3">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="px-2 py-0 text-xs">
              {album.year}
            </Badge>
            {album.genre && (
              <Badge variant="secondary" className="px-2 py-0 text-xs">
                {album.genre}
              </Badge>
            )}
          </div>

          {(album.averageRating || 0) > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              <span className="text-xs">{album.averageRating}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};
