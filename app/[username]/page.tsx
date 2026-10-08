import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { RenderPortfolio } from "@/lib/render-portfolio";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.users.findUnique({ where: { username: username.toLowerCase() }, select: { name: true, username: true } });
  return user ? { title: `${user.name || user.username} | Portofolio`, description: `Portofolio ${user.name || user.username}` } : { title: "Portofolio tidak ditemukan" };
}

export default async function UserPortfolio({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!/^[a-z0-9_]{3,30}$/i.test(username)) notFound();
  const user = await prisma.users.findUnique({ where: { username: username.toLowerCase() }, select: { id: true, username: true } });
  if (!user) notFound();
  return <RenderPortfolio ownerId={user.id} username={user.username} />;
}
