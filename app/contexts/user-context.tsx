import type { ReactNode } from "react";
import { createContext, useContext } from "react";

type UserContextType = {
  isUserAdmin?: boolean;
  userId?: number;
  username?: string;
};

type UserProviderProps = {
  children: ReactNode;
  isUserAdmin?: boolean;
  userId?: number;
  username?: string;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
  children,
  isUserAdmin,
  userId,
  username,
}: UserProviderProps) => {
  return (
    <UserContext.Provider value={{ isUserAdmin, userId, username }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const user = useContext(UserContext) as UserContextType;
  return user;
};
