import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiResponse, handleError } from "@/lib/api-utils";
import { getOwnerId, getReadOwnerId } from "@/lib/portfolio-owner";
import { z } from "zod";
import { uploadToCloudinary } from "@/lib/cloudinary";

const educationSchema = z.object({ name: z.string().optional(), school: z.string().min(1), major: z.string().min(1), date: z.string().min(1) });

export async function GET(req: NextRequest) {
  try {
    const ownerId = await getReadOwnerId(req);
    if (ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);
    const educations = await prisma.educations.findMany({ where: { ownerId }, orderBy: { id: "desc" } });
    return apiResponse(true, educations, "Educations fetched successfully.", 200);
  } catch (error) { return handleError(error, "Error fetching educations"); }
}

export async function POST(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const form = await req.formData();
    const input = educationSchema.safeParse({ name: form.get("name")?.toString() || "", school: form.get("school")?.toString() || "", major: form.get("major")?.toString() || "", date: form.get("date")?.toString() || "" });
    if (!input.success) return handleError(input.error.flatten().fieldErrors, "Invalid input", 400);
    const image = form.get("image");
    let imageUrl = input.data.name || "";
    if (image instanceof File && image.size) {
      const uploaded = await uploadToCloudinary(image, "myporto/educations");
      if (!uploaded) return handleError(null, "Gagal mengunggah logo pendidikan.", 400);
      imageUrl = uploaded;
    }
    if (!imageUrl) return handleError(null, "Logo pendidikan wajib diunggah.", 400);
    const education = await prisma.educations.create({ data: { ...input.data, name: imageUrl, ownerId } });
    return apiResponse(true, education, "Education created.", 201);
  } catch (error) { return handleError(error, "Failed creating education"); }
}

export async function PUT(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    const form = await req.formData();
    const input = educationSchema.safeParse({ name: form.get("name")?.toString() || "", school: form.get("school")?.toString() || "", major: form.get("major")?.toString() || "", date: form.get("date")?.toString() || "" });
    if (!Number.isInteger(id) || id < 1) return handleError(null, "Valid ID is required.", 400);
    if (!input.success) return handleError(input.error.flatten().fieldErrors, "Invalid input", 400);
    const existing = await prisma.educations.findFirst({ where: { id, ownerId } });
    if (!existing) return handleError(null, "Education not found.", 404);
    const image = form.get("image");
    let imageUrl = input.data.name || existing.name;
    if (image instanceof File && image.size) {
      const uploaded = await uploadToCloudinary(image, "myporto/educations");
      if (!uploaded) return handleError(null, "Gagal mengunggah logo pendidikan.", 400);
      imageUrl = uploaded;
    }
    const education = await prisma.educations.update({ where: { id }, data: { ...input.data, name: imageUrl } });
    return apiResponse(true, education, "Education updated.", 200);
  } catch (error) { return handleError(error, "Failed updating education"); }
}

export async function DELETE(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id < 1) return handleError(null, "Valid ID is required.", 400);
    const existing = await prisma.educations.findFirst({ where: { id, ownerId } });
    if (!existing) return handleError(null, "Education not found.", 404);
    await prisma.educations.delete({ where: { id } });
    return apiResponse(true, null, "Education deleted.", 200);
  } catch (error) { return handleError(error, "Failed deleting education"); }
}
