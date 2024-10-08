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
import { ArchiveAlbum } from "~/services/album.server";
import { useUser } from "~/contexts/user-context";

export const AlbumPreviewCard = ({ album }: { album: ArchiveAlbum }) => {
  const user = useUser();

  console.log("album.artists", album.artists);
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

  console.log({ album });

  return (
    <Link to={`/archive/${format(new Date(album.listenDate!), "yyyy-MM-dd")}`}>
      <Card
        className={
          "shadow-md transition-transform hover:overflow-visible hover:bg-accent md:hover:scale-105"
        }
        key={album.id}
      >
        <div className="flex items-center justify-between border-b-2 border-accent bg-transparent p-4 font-semibold">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="justify-self-center">
                <p className="@sm:hidden">
                  {format(album.listenDate!, "eee d MMM ''yy")}
                </p>
              </TooltipTrigger>
              <TooltipContent className="z-30">
                <p className="p-4">
                  The date the album was picked randomly to be listened to.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {album.userRating ? (
            <Badge variant="secondary">My rating: {album.userRating / 2}</Badge>
          ) : user.userId ? (
            <Badge variant="destructive">Unreviewed</Badge>
          ) : null}
        </div>
        <CardImage src={album.image!} alt="Album Cover" />
        <div className="relative p-4">
          <h3 className="mb-1 h-14 overflow-hidden text-start text-lg font-semibold hover:underline">
            {album.title}
          </h3>
          <div className="mb-2 flex items-center justify-between pt-2">
            <div className="font-semibold text-gray-500 dark:text-gray-300">
              <Artists artists={album.artists.map((artist) => artist.name)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="font-semibold text-gray-500 dark:text-gray-300">
                    {album.year}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Album release year</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <p className="flex items-center gap-1 text-sm">
                <MessageCircle height={16} width={16} />
                {album.reviewCount}
              </p>
              <p className="flex items-center gap-1 text-sm">
                <Star height={16} width={16} />
                {album.userRating ? album.averageRating : ""}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
