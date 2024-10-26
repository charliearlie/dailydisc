import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import { getUserById } from "./user.server";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const spotifyCookie = createCookie("spotifyAccessToken");

const USER_SESSION_KEY = "userId";

export async function createUserSession(
  userId: number,
  redirectTo: string = "/",
) {
  const session = await sessionStorage.getSession();
  session.set(USER_SESSION_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // 7 days,
      }),
    },
  });
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") return null;
  return userId;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  if (!session) {
    return redirect("/");
  }
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function getUserFromRequestContext(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "number") {
    return null;
  }

  return await getUserById(userId);
}
