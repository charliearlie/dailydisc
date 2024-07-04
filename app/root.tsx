import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import stylesheet from "~/styles/tailwind.css?url";
import fontStylesheet from "~/styles/fonts.css?url";
import { Header } from "~/components/header/header";
import { UserProvider } from "./contexts/user-context";
import { getUserFromRequestContext } from "./services/session";
import { ErrorBoundaryComponent } from "./components/error-boundary";
import { Toaster } from "./components/common/ui/toaster";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: fontStylesheet },
  {
    rel: "icon",
    href: "/favicon.ico",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromRequestContext(request);
  return json({ user });
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta charSet="utf-8" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <Document>
      <UserProvider
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
            <div className="flex items-center gap-2">
              <img
                src="/DailyDisc.png"
                alt="Daily Disc"
                className="h-16 w-16"
              />
              <p className="text-accent-foreground">
                &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
        <Toaster />
      </UserProvider>
    </Document>
  );
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <UserProvider
      username={loaderData?.user?.username}
      userId={loaderData?.user?.id}
    >
      <Outlet />
    </UserProvider>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <div className="flex-1">
        <ErrorBoundaryComponent />
      </div>
    </Document>
  );
}
