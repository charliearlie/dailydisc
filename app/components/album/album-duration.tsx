import { intervalToDuration } from "date-fns";

export const AlbumDuration = ({ durationInMS }: { durationInMS: number }) => {
  const duration = intervalToDuration({ start: 0, end: durationInMS });

  const hours = duration.hours
    ? `${duration.hours} hour${duration.hours > 1 ? "s" : ""} `
    : "";
  const minutes = `${duration.minutes} minute${duration.minutes !== 1 ? "s" : ""}`;
  const seconds = !duration.hours
    ? ` ${duration.seconds} second${duration.seconds !== 1 ? "s" : ""}`
    : "";

  return `${hours}${minutes}${seconds}`;
};
