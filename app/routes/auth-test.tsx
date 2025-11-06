import { useAuth, useUser } from "@clerk/remix";
import { useEffect, useState } from "react";

export default function AuthTest() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="space-y-2">
        <p>Is Signed In: {isSignedIn ? "Yes" : "No"}</p>
        <p>User ID: {userId || "None"}</p>
        <p>Email: {user?.emailAddresses?.[0]?.emailAddress || "None"}</p>
        <p>Username: {user?.username || "None"}</p>
      </div>
      {!isSignedIn && (
        <div className="mt-4">
          <p>You need to sign in through Clerk's development tools.</p>
          <p>Open your browser's dev tools and look for Clerk panel.</p>
        </div>
      )}
    </div>
  );
}