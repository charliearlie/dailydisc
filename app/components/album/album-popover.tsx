import { Link } from "@remix-run/react";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";
import { Button } from "../common/ui/button";

export const AlbumPopover = ({
  appleMusicId,
  appleMusicUrl,
  image,
  title,
}: {
  appleMusicId: string;
  appleMusicUrl: string;
  image: string;
  title: string;
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <img
          className="group relative mx-auto block h-[320px] w-[320px] cursor-pointer overflow-hidden rounded-lg border-4 border-primary bg-accent duration-300 hover:-translate-y-1 hover:scale-110"
          alt={`${title} album artwork`}
          height="250"
          src={image!}
          style={{
            aspectRatio: "250/250",
            objectFit: "cover",
          }}
          width="250"
        />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-4">
        <Button asChild variant="secondary" className="w-full">
          <Link to={appleMusicUrl} target="_blank" rel="noopener noreferrer">
            Listen on Apple Music
          </Link>
        </Button>
        <Button asChild variant="destructive" className="w-full">
          <Link
            to={`https://scrbbl.vercel.app/album-scrobble/album-information/${appleMusicId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Scrobble album
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
};
