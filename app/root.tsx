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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: fontStylesheet },
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

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <Document>
      <Header />
      <UserProvider
        username={loaderData.user?.username}
        userId={loaderData.user?.id}
      >
        <Outlet />
      </UserProvider>
    </Document>
  );
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <UserProvider
      username={loaderData.user?.username}
      userId={loaderData.user?.id}
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
