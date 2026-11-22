import { cookies } from "next/headers";
import { UserInfo } from "./definitions";
export async function getMe(): Promise<UserInfo[] | undefined> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(process.env.API + "getme", {
    method: "GET",
    headers: {
      accept: "*/*",
      Cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    return undefined;
  }
  const data: UserInfo[] = await response.json();
  return data;
}
