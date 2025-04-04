import { Link } from "@remix-run/react";
import { Music, Share2 } from "lucide-react";
import { Button } from "../common/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../common/ui/popover";

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
        <div className="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300">
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
            <Share2 className="h-10 w-10 scale-0 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
          </div>
          <img
            className="aspect-square w-full max-w-[350px] transform rounded-xl object-cover shadow-md transition-all duration-500 group-hover:scale-105"
            alt={`${title} album artwork`}
            src={image}
            width="350"
            height="350"
            loading="eager"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4 p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="space-y-3">
          <Button
            asChild
            variant="default"
            className="w-full justify-start gap-2 bg-[#fa586a] hover:bg-[#fa586a]/90"
          >
            <Link to={appleMusicUrl} target="_blank" rel="noopener noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M12.287 6.615c1.247-1.342 3.17-1.467 3.17-1.467s.274 1.846-.96 3.326c-1.323 1.59-2.864 1.32-2.864 1.32s-.313-1.273.654-3.18zm-2.3 10.26c0 .307.102.76.247 1.165.186.492.624 1.227 1.061 1.227.38 0 .525-.244.995-.244.47 0 .651.247 1.048.247.392 0 .77-.693.996-1.186.245-.529.344-1.047.347-1.072-.022-.01-1.344-.519-1.344-1.956 0-1.223 1-1.811 1.045-1.835-1.023-1.5-2.601-.626-3.22-.31-.299.154-.74.38-1.174.38z" />
              </svg>
              Listen on Apple Music
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="w-full justify-start gap-2"
          >
            <Link
              to={`https://scrbbl.vercel.app/album-scrobble/album-information/${appleMusicId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Music className="h-5 w-5" />
              Scrobble album
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
