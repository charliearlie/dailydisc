import { SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData, type Navigation } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RouteId } from "./types/route-id";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * If a condition fails, throw a new Error response
 */
export function invariantResponse(
  condition: unknown,
  message: string | (() => string),
  responseInit?: ResponseInit,
): asserts condition {
  if (!condition) {
    throw new Response(
      typeof message === "function"
        ? message()
        : message || "An invariant failed. Provide a message to explain why",
      { status: 400, ...responseInit },
    );
  }
}

export function isFormInPendingState(
  navigation: Navigation,
  formAction: string,
) {
  return (
    navigation.state !== "idle" &&
    navigation.formAction === formAction &&
    navigation.formMethod === "POST"
  );
}

export function buildListingEndDateAndTime(endDateString?: string) {
  if (!endDateString) {
    return;
  }

  const endDate = new Date(endDateString);
  const currentDate = new Date();
  endDate.setHours(currentDate.getHours() + 1);
  endDate.setMinutes(currentDate.getMinutes());
  endDate.setSeconds(currentDate.getSeconds());

  return endDate;
}

export function camelCaseToHumanReadable(str: string) {
  const withSpaces = str.replace(/([a-z])([A-Z0-9])/g, "$1 $2");

  const titleCase = withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);

  return titleCase;
}

export function useRouteLoaderDataTyped<T = unknown>(routeId: RouteId) {
  return useRouteLoaderData(routeId) as SerializeFrom<T>;
}

export function removeFeaturedArtists(trackName: string) {
  trackName = trackName.replace(/\s*\(feat\.\s*[^)]+\)/g, "");
  trackName = trackName.replace(/\s*\[feat\.\s*[^\]]+\]/g, "");

  return trackName.trim();
}

export function parseVercelId(id: string | null) {
  const parts = id?.split(":").filter(Boolean);
  console.log("parts", parts);
  if (!parts) {
    console.log('"x-vercel-id" header not present. Running on localhost?');
    return { proxyRegion: "localhost", computeRegion: "localhost" };
  }
  const proxyRegion = parts[0];
  const computeRegion = parts[parts.length - 2];
  return { proxyRegion, computeRegion };
}
