import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function getOwnerId(req: NextRequest): Promise<number | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const id = Number(token?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function resolvePublicOwner(username: string | null): Promise<number | null | undefined> {
  if (!username) return null;
  const user = await prisma.users.findUnique({ where: { username: username.toLowerCase() }, select: { id: true } });
  return user?.id;
}

export async function getReadOwnerId(req: NextRequest): Promise<number | null | undefined> {
  const username = req.nextUrl.searchParams.get("username");
  return username ? resolvePublicOwner(username) : getOwnerId(req);
}
