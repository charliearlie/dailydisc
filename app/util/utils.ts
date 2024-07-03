import { SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData, type Navigation } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import type { Assets } from "~/util/types/assets";

import { twMerge } from "tailwind-merge";
import { RouteId } from "./types/route-id";

export function asset(file: Assets, base?: URL): string {
  if (!base) return file;
  return new URL(file, base).toString();
}

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
  return {
    proxyRegion: regions[proxyRegion],
    computeRegion: regions[computeRegion],
  };
}

export const regions: Record<string, string> = {
  sfo1: "San Francisco",
  iad1: "Washington, D.C.",
  pdx1: "Portland",
  cle1: "Cleveland",
  gru1: "São Paulo",
  hkg1: "Hong Kong",
  hnd1: "Tokyo",
  icn1: "Seoul",
  kix1: "Osaka",
  sin1: "Singapore",
  bom1: "Mumbai",
  syd1: "Sydney",
  cdg1: "Paris",
  arn1: "Stockholm",
  dub1: "Dublin",
  lhr1: "London",
  fra1: "Frankfurt",
  cpt1: "Cape Town",
  dev1: "localhost",
};
