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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: fontStylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromRequestContext(request);
  return json({ user });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <UserProvider
          username={loaderData.user?.username}
          userId={loaderData.user?.id}
        >
          <Header />
          {children}
        </UserProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
