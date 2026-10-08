import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiResponse, handleError } from "@/lib/api-utils";
import { z } from "zod";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { getOwnerId, getReadOwnerId } from "@/lib/portfolio-owner";

const techStackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized.", 401);
  }

  try {
    const formData = await req.formData();
    const parsed = techStackSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const image = formData.get("image") as File;
    const imageUrl = await uploadToCloudinary(image, "/portofolio/techstacks");

    if (!imageUrl) {
      return handleError(null, "Image upload failed.", 400);
    }

    await prisma.techStack.create({
      data: {
        ...parsed.data,
        image: imageUrl,
        ownerId,
      },
    });

    return apiResponse(true, null, "Techstack created successfully.", 201);
  } catch (error) {
    return handleError(error, "Error creating Techstack");
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get("filter");
    const strId = searchParams.get("id");
    const ownerId = await getReadOwnerId(req);
    if (ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);

    if (strId) {
      const id = parseInt(strId, 10);

      const techStack = await prisma.techStack.findFirst({
        where: { id, ownerId },
      });

      return apiResponse(true, techStack, "TechStack fetched successfully.", 200);
    }

    if (filter) {
      const selectClause = filter;

      const techStack = await prisma.techStack.findMany({
        where: { ownerId },
        select: { [selectClause]: true },
      });

      return apiResponse(true, techStack, "TechStack fetched successfully.", 200);
    }

    const techStack = await prisma.techStack.findMany({ where: { ownerId } });

    return apiResponse(true, techStack, "TechStack fetched successfully.", 200);
  } catch (error) {
    return handleError(error, "Failed fetching techStacks");
  }
}

export async function DELETE(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    let id = searchParams.get("id");

    const newId = id != null ? parseInt(id, 10) : undefined;

    const techstackToDelete = await prisma.techStack.findFirst({
      where: { id: newId, ownerId },

      select: { image: true },
    });

    if (!techstackToDelete) {
      return handleError(null, "Techstack not found", 404);
    }

    const imageUrl = techstackToDelete.image;

    if (imageUrl) {
      const match = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
      const publicId = match ? match[1] : null;

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed remove photo on Cloudinary:", err);
        }
      }
    }

    await prisma.techStack.delete({ where: { id: newId } });

    return apiResponse(true, null, "Delete techstack successfully.", 200);
  } catch (error) {
    return handleError(error, "Failed delete techstack");
  }
}

export async function PUT(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const searchParams = req.nextUrl.searchParams;
    const strId = searchParams.get("id");

    const id = strId ? parseInt(strId, 10) : NaN;

    if (isNaN(id)) {
      return handleError(null, "ID is required and must be a valid number.", 400);
    }

    const formData = await req.formData();

    const parsed = techStackSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const newImageFile = formData.get("image") as File | null;
    const deletePhotoExplicitly = formData.get("deleteImage") === "true";

    const currentProject = await prisma.techStack.findFirst({
      where: { id, ownerId },
    });

    if (!currentProject) {
      return handleError(null, "Project not found", 404);
    }

    let finalImageUrl: string | null = currentProject.image;

    if (newImageFile) {
      finalImageUrl = await uploadToCloudinary(
        newImageFile,
        "/portofolio/techstacks"
      );
    } else if (deletePhotoExplicitly) {
      finalImageUrl = null;
    }

    const updatedTechStacksResult = await prisma.techStack.update({
      where: {
        id: currentProject.id,
      },
      data: {
        ...parsed.data,
        image: finalImageUrl as string,
      },
    });

    return apiResponse(
      true,
      updatedTechStacksResult,
      "TechStack updated successfully.",
      200
    );
  } catch (error) {
    return handleError(error, "Failed update techstack");
  }
}

