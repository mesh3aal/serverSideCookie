"use client";

import { use } from "react";
import { UserContext } from "../lib/UserContext";

export function useGetUser() {
  const { name, email } = use(UserContext);
  return { name, email };
}
