import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiResponse, handleError } from "@/lib/api-utils";
import { getOwnerId, resolvePublicOwner } from "@/lib/portfolio-owner";
import { z } from "zod";

const aboutSchema = z.object({ about: z.string(), what_i_do: z.string(), role: z.string() });

async function ownerForRequest(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  return username ? resolvePublicOwner(username) : getOwnerId(req);
}

export async function GET(req: NextRequest) {
  try {
    const ownerId = await ownerForRequest(req);
    if (ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);
    const id = req.nextUrl.searchParams.get("id");
    const data = id
      ? await prisma.about.findFirst({ where: { id: Number(id), ownerId } })
      : await prisma.about.findMany({ where: { ownerId }, orderBy: { id: "asc" }, take: 1 });
    return apiResponse(true, data, "About fetched successfully.", 200);
  } catch (error) { return handleError(error, "Error fetching about"); }
}

export async function POST(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const data = await req.formData();
    const parsed = aboutSchema.safeParse({ about: data.get("about")?.toString() || "", what_i_do: data.get("whatIDo")?.toString() || "", role: data.get("role")?.toString() || "" });
    if (!parsed.success) return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    const about = await prisma.about.create({ data: { ...parsed.data, ownerId } });
    return apiResponse(true, about, "About created successfully.", 201);
  } catch (error) { return handleError(error, "Error creating about"); }
}

export async function PUT(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!id) return handleError(null, "ID is required in query parameters.", 400);
    const parsed = aboutSchema.safeParse(await req.json());
    if (!parsed.success) return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    const existing = await prisma.about.findFirst({ where: { id, ownerId } });
    if (!existing) return handleError(null, "About not found.", 404);
    const about = await prisma.about.update({ where: { id }, data: parsed.data });
    return apiResponse(true, about, "About updated successfully.", 200);
  } catch (error) { return handleError(error, "Error updating about"); }
}
