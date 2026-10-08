import prisma from "@/lib/prisma";
import { RenderPortfolio } from "@/lib/render-portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Keep the original root portfolio on the first account; each account also
  // gets this exact portfolio layout at /{username}.
  const firstUser = await prisma.users.findFirst({ orderBy: { id: "asc" }, select: { id: true, username: true } });
  return <RenderPortfolio ownerId={firstUser?.id ?? null} username={firstUser?.username} />;
}
