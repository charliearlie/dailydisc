import type { LoaderFunctionArgs } from "@remix-run/node";
import { logout } from "~/services/session";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await logout(request);
};

export default function LogoutRoute() {
  return <h1>Logging you out</h1>;
}
