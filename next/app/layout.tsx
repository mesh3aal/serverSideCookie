import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/Components/Header";
import { getMe } from "./lib/auth";
import { UserProvider } from "./lib/UserContext";

export const metadata: Metadata = {
  title: "E-Commernce",
  description: "Home page.",
};

async function UserProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const userInfo = await getMe();
  return <UserProvider userInfo={userInfo}>{children}</UserProvider>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Suspense>
          <UserProviderWrapper>
            <Header />
            {children}
          </UserProviderWrapper>
        </Suspense>
      </body>
    </html>
  );
}
