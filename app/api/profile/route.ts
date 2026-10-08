import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { apiResponse, handleError } from "@/lib/api-utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getOwnerId, resolvePublicOwner } from "@/lib/portfolio-owner";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");
    const ownerId = username ? await resolvePublicOwner(username) : await getOwnerId(req);
    if (username && ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);
    const profile = ownerId
      ? await prisma.users.findUnique({ where: { id: ownerId }, select: { username: true, name: true, email: true, phone: true, photo: true, instagram: true, twitter: true, linkedin: true, github: true, upwork: true } })
      : await prisma.users.findFirst({ orderBy: { id: "asc" }, select: { username: true, name: true, email: true, phone: true, photo: true, instagram: true, twitter: true, linkedin: true, github: true, upwork: true } });
    return apiResponse(true, profile, "Profile fetched successfully.", 200);
  } catch (error) { return handleError(error, "Error fetching profile"); }
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40),
  instagram: z.string().trim().max(100),
  twitter: z.string().trim().max(100),
  linkedin: z.string().trim().max(300),
  github: z.string().trim().max(300),
  upwork: z.string().trim().url().or(z.literal("")),
});

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const ownerId = Number(token?.id);
  if (!Number.isInteger(ownerId) || ownerId < 1) return handleError(null, "Unauthorized", 401);
  try {
    const form = await req.formData();
    const parsed = profileSchema.safeParse({ name: form.get("name"), email: form.get("email"), phone: form.get("phone") || "", instagram: form.get("instagram") || "", twitter: form.get("twitter") || "", linkedin: form.get("linkedin") || "", github: form.get("github") || "", upwork: form.get("upwork") || "" });
    if (!parsed.success) return handleError(parsed.error.flatten().fieldErrors, "Data profil tidak valid.", 400);
    const current = await prisma.users.findUnique({ where: { id: ownerId }, select: { photo: true } });
    if (!current) return handleError(null, "Account not found.", 404);
    const photo = form.get("photo");
    const deletePhoto = form.get("deletePhoto") === "true";
    let photoUrl = current.photo;
    if (photo instanceof File && photo.size) photoUrl = await uploadToCloudinary(photo, "/portofolio/profile");
    else if (deletePhoto) photoUrl = null;
    const updated = await prisma.users.update({
      where: { id: ownerId },
      data: { ...parsed.data, email: parsed.data.email.toLowerCase(), photo: photoUrl },
      select: { id: true, username: true, name: true, email: true, phone: true, photo: true, instagram: true, twitter: true, linkedin: true, github: true, upwork: true },
    });
    return apiResponse(true, updated, "Profile updated successfully.", 200);
  } catch (error: any) {
    if (error?.code === "P2002") return handleError(null, "Email sudah digunakan.", 409);
    return handleError(error, "Error updating profile");
  }
}
