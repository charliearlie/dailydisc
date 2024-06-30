import { Album } from "~/util/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../common/ui/carousel";
import { AlbumPreviewCard } from "./album-preview-card";
import { Link } from "@remix-run/react";
import { Card, CardImage } from "../common/ui/card";
import { format } from "date-fns";

export const RelatedAlbums = ({ albums }: { albums: Album[] }) => {
  return (
    <Carousel>
      <CarouselContent>
        <>
          {albums.map((album) => (
            <CarouselItem key={album.id} className="md:basis-1/4 lg:basis-1/5">
              <Link to={`/album/${album.id}`}>
                <Card
                  className={"shadow-md transition-transform"}
                  key={album.id}
                >
                  <CardImage src={album.image} alt="Album Cover" />
                  <div className="relative p-4">
                    <h3 className="mb-1 h-14 overflow-hidden text-start text-lg font-semibold hover:underline">
                      {album.name}
                    </h3>
                    <h4 className="mb-2 text-sm font-medium">
                      {album.primaryArtist}
                    </h4>
                    <p>{format(album.releaseDate, "yyyy")}</p>
                  </div>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
