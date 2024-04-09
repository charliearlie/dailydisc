import type { ReactNode } from "react";
import { createContext, useContext } from "react";

type UserContextType = {
  userId?: number;
  username?: string;
};

type UserProviderProps = {
  userId?: number;
  username?: string;
  children: ReactNode;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
  children,
  userId,
  username,
}: UserProviderProps) => {
  return (
    <UserContext.Provider value={{ userId, username }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const user = useContext(UserContext) as UserContextType;
  return user;
};
