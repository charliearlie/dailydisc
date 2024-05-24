import { Link } from "@remix-run/react";
import { format } from "date-fns";
import { MessageCircle, Star } from "lucide-react";
import { Card, CardImage } from "~/components/common/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/ui/tooltip";
import { Badge } from "../common/ui/badge";
import { getArchiveAlbums } from "~/services/album";

export const AlbumPreviewCard = ({
  album,
}: {
  album: Omit<Awaited<ReturnType<typeof getArchiveAlbums>>[0], "listenDate"> & {
    listenDate: string | null;
  };
}) => {
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
    <Card className="shadow-md" key={album.id}>
      <div className="flex h-8 items-center justify-center bg-transparent font-semibold">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="">{format(album.listenDate!, "eee d MMM")}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="p-4">
                The date the album was picked randomly to be listened to.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <CardImage
        to={`/?date=${format(album.listenDate!, "yyyy-MM-dd")}`}
        src={album.image!}
        alt="Album Cover"
      />
      <div className="relative p-4">
        <h3 className="mb-1 h-14 text-start text-lg font-semibold">
          <Link className="hover:underline" to="#">
            {album.title}
          </Link>
        </h3>
        <div className="mb-2 flex items-center justify-between pt-2">
          <p className="font-semibold text-gray-500 dark:text-gray-300">
            <Artists
              artists={album.artistsToAlbums.map((link) => link.artist.name)}
            />
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="font-semibold">{album.year}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Album release year</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-between">
          <Badge className="text-sm">{album.genre}</Badge>
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1 text-sm">
              <MessageCircle height={16} width={16} />
              {album.reviews.length}
            </p>
            <p className="flex items-center gap-1 text-sm">
              <Star height={16} width={16} />
              {album.averageRating || ""}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
