import NavMenu from "./_components/NavMenu";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import Footer from "@/app/_sections/Footer";
import { getPortfolioLastUpdated } from "@/lib/portfolio-last-updated";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const token = await getToken({
    req: { headers: requestHeaders } as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const parsedOwnerId = Number(token?.id);
  const ownerId = Number.isInteger(parsedOwnerId) && parsedOwnerId > 0 ? parsedOwnerId : null;
  const [profile, lastUpdated] = await Promise.all([
    ownerId ? prisma.users.findUnique({ where: { id: ownerId }, select: { name: true } }) : null,
    ownerId ? getPortfolioLastUpdated(ownerId) : null,
  ]);

  return (
    <main className="mx-5 flex min-h-screen flex-col py-5 sm:mx-10">
      <div className="mx-auto w-full max-w-6xl sm:px-4">
        <div className="flex items-end">
          <NavMenu />
        </div>
        <div className="border-b border-gray-300 lg:w-full sm:block md:block lg:block hidden mt-5" />
      </div>
      <div className="flex-1">{children}</div>
      <div className="mt-10 sm:w-full sm:mx-0 mx-5">
        <Footer name={profile?.name || "Sayid"} lastUpdated={lastUpdated} showLinks={false} />
      </div>
    </main>
  );
}
