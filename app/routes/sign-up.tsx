import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img
            className="h-32 w-32 mx-auto mb-4"
            src="/DailyDisc.png"
            alt="Daily Disc"
          />
          <h1 className="text-2xl font-bold">Sign up for Daily Disc</h1>
          <p className="text-muted-foreground mt-2">
            Please use the Clerk development panel to sign up for now.
          </p>
        </div>
        <div className="bg-card border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            During development, you can access sign up through the Clerk User Button from the header.
          </p>
          <div className="mt-4">
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}