import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Analytics } from "@vercel/analytics/react";
import { ClerkApp } from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";

import stylesheet from "~/styles/tailwind.css?url";
import fontStylesheet from "~/styles/fonts.css?url";
import { Header } from "~/components/header/header";
import { UserProvider } from "./contexts/user-context";
import { ErrorBoundaryComponent } from "./components/error-boundary";
import { Toaster } from "./components/common/ui/toaster";
import { BottomNavigation } from "./components/bottom-navigation/bottom-navigation";
import { getUserByClerkId } from "./services/user.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: fontStylesheet },
  {
    rel: "icon",
    href: "/favicon.ico",
  },
];

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);

  // Define public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/api/webhooks/clerk'];
  const url = new URL(args.request.url);
  const pathname = url.pathname;

  // For now, let's be less aggressive with redirects to test the setup
  // Comment out the redirect temporarily
  // if (!userId && !publicRoutes.includes(pathname)) {
  //   return redirect("/sign-in");
  // }

  // Get local user data if clerk user exists
  let user = null;
  let isUserAdmin = false;
  if (userId) {
    user = await getUserByClerkId(userId);
    isUserAdmin = user?.id === 2;
  }

  // rootAuthLoader makes auth state available to the client  
  return rootAuthLoader(args, () => {
    return json({
      user,
      isUserAdmin,
    });
  });
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta charSet="utf-8" />
        <meta
          name="google-site-verification"
          content="VcSXpFWzqeqvHaGPv-xoVDFsA5cmsic0iesBVL1ql5k"
        />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export function Layout() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <Document>
      <UserProvider
        isUserAdmin={loaderData?.isUserAdmin}
        username={loaderData?.user?.username}
        userId={loaderData?.user?.id}
      >
        <Header />
        <div className=" min-h-[calc(100vh-148px)]">
          <Outlet />
        </div>
        <footer className="bg-accent py-2">
          <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
            <p className="text-accent-foreground">
              Developed by{" "}
              <span className="font-medium text-primary hover:opacity-80">
                <a
                  href="https://www.github.com/charliearlie"
                  rel="noreferrer"
                  target="_blank"
                >
                  charliearlie
                </a>
              </span>
            </p>
            <div className="flex items-center gap-2 py-4">
              <p className="text-accent-foreground">
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
        <BottomNavigation />
        <Toaster />
      </UserProvider>
      <Analytics />
    </Document>
  );
}

function App() {
  return <Outlet />;
}

export default ClerkApp(App);

export function ErrorBoundary() {
  return (
    <Document>
      <div className="flex-1">
        <ErrorBoundaryComponent />
      </div>
    </Document>
  );
}
