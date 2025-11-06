import { useAuth, useUser as useClerkUser } from "@clerk/remix";

// Client-side only hook for Clerk data
export const useClerk = () => {
  // Only call hooks on the client side
  if (typeof window === 'undefined') {
    return {
      isSignedIn: false,
      userId: null,
      user: null,
    };
  }

  const { isSignedIn, userId } = useAuth();
  const user = useClerkUser();

  return {
    isSignedIn,
    userId,
    user,
  };
};