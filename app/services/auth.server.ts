import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { getUserByClerkId } from "./user.server";

export async function requireAuth(args: LoaderFunctionArgs | ActionFunctionArgs) {
  const { userId: clerkId } = await getAuth(args);
  
  if (!clerkId) {
    throw redirect("/sign-in");
  }
  
  return clerkId;
}

export async function requireUser(args: LoaderFunctionArgs | ActionFunctionArgs) {
  const clerkId = await requireAuth(args);
  const user = await getUserByClerkId(clerkId);
  
  if (!user) {
    throw redirect("/sign-in");
  }
  
  return { user, clerkId };
}

export async function getOptionalAuth(args: LoaderFunctionArgs | ActionFunctionArgs) {
  const { userId: clerkId } = await getAuth(args);
  
  if (!clerkId) {
    return { user: null, clerkId: null };
  }
  
  const user = await getUserByClerkId(clerkId);
  return { user, clerkId };
}