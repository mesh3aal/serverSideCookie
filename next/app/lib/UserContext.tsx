"use client";

import { createContext, type ReactNode } from "react";

export interface UserData {
  name: string | undefined;
  email: string | undefined;
}

export const UserContext = createContext<UserData>({
  name: undefined,
  email: undefined,
});

export function UserProvider({
  userInfo,
  children,
}: {
  userInfo: { type: string; value: string }[] | undefined;
  children: ReactNode;
}) {
  const name = userInfo?.find((item) => item.type === "name")?.value;
  const email = userInfo?.find((item) => item.type === "emailaddress")?.value;

  return (
    <UserContext value={{ name, email }}>
      {children}
    </UserContext>
  );
}
