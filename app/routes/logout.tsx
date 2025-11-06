import { useEffect } from "react";
import { useClerk } from "@clerk/remix";
import { redirect } from "@remix-run/node";

export const loader = async () => {
  // Redirect to sign-in after logout
  return redirect("/sign-in");
};

export default function LogoutRoute() {
  const clerk = useClerk();

  useEffect(() => {
    clerk.signOut();
  }, [clerk]);

  return <h1>Logging you out...</h1>;
}
