import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, handleError } from "@/lib/api-utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getOwnerId, getReadOwnerId } from "@/lib/portfolio-owner";

const projectSchema = z.object({
  judul: z.string().min(1, "Judul is required"),
  category: z.string().optional(),
  desc: z.string().optional(),
  status: z.string().optional(),
  url: z.string().optional(),
  tech: z.string().optional(),
  site: z.string().optional(),
});

const patchProjectSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

// checking validate UUID v4
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// --- POST /api/projects ---
export async function POST(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const formData = await req.formData();

    const parsed = projectSchema.safeParse({
      judul: formData.get("judul"),
      category: formData.get("category") || "General",
      desc: formData.get("desc"),
      status: formData.get("status"),
      url: formData.get("url"),
      tech: formData.get("tech"),
      site: formData.get("site"),
    });

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const photo = formData.get("photo") as File;
    const photoUrl = await uploadToCloudinary(photo, "myporto/projects");

    await prisma.projects.create({
      data: {
        ...parsed.data,
        category: parsed.data.category || "General",
        photo: photoUrl,
        ownerId,
      },
    });

    return apiResponse(true, null, "Project created successfully.", 201);
  } catch (error) {
    return handleError(error, "Error creating project");
  }
}

// --- GET /api/projects ---
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const ownerId = await getReadOwnerId(req);
    if (ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);
    const viewerOwnerId = await getOwnerId(req);

    if (status && !["draft", "published", "archived"].includes(status)) {
      return handleError(
        null,
        "Invalid status value. Must be 'draft', 'published', or 'archived'.",
        400
      );
    }

    let whereClause: Prisma.ProjectsWhereInput = { ownerId };

    if (id) {
      if (!isValidUUID(id)) {
        return handleError(null, "Invalid UUID.", 400);
      }
      whereClause.id = id;
    }
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (ownerId === null || viewerOwnerId !== ownerId) whereClause.status = "published";

    const projectsData = await prisma.projects.findMany({
      where: whereClause,
      orderBy: [{ status: "desc" }, { judul: "asc" }],
    });

    if (!projectsData.length) {
      return handleError(null, "Project not found", 404);
    }

    return apiResponse(true, projectsData, "Projects fetched successfully", 200);
  } catch (error: unknown) {
    return handleError(error, "Internal server error");
  }
}

// --- PUT /api/projects?id=:id ---
export async function PUT(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  if (!req.body) {
    return handleError(null, "Request body is required", 400);
  }

  try {
    const seacrhParams = req.nextUrl.searchParams;
    const idParam = seacrhParams.get("id");

    if (!idParam) {
      return handleError(null, "UUID id needed.", 400);
    }

    const formData = await req.formData();
    const parsed = projectSchema.safeParse({
      judul: formData.get("judul"),
      category: formData.get("category") || "General",
      desc: formData.get("desc"),
      status: formData.get("status"),
      url: formData.get("url"),
      tech: formData.get("tech"),
      site: formData.get("site"),
    });

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const newPhotoFile = formData.get("photo") as File | null;
    const deletePhotoExplicitly = formData.get("deletePhoto") === "true";

    const updatedProject = await prisma.$transaction(async (tx) => {
      let currentProject;
      if (idParam) {
        currentProject = await tx.projects.findFirst({
          where: { id: idParam, ownerId },
        });
      }

      if (!currentProject) {
        throw new Error("Project not found");
      }

      let finalPhotoUrl: string | null = currentProject.photo;

      if (newPhotoFile) {
        finalPhotoUrl = await uploadToCloudinary(
          newPhotoFile,
          "myporto/projects"
        );
      } else if (deletePhotoExplicitly) {
        finalPhotoUrl = null;
      }

      const updatedProjectResult = await tx.projects.update({
        where: {
          id: currentProject.id,
        },
        data: {
          ...parsed.data,
          category: parsed.data.category || "General",
          photo: finalPhotoUrl,
        },
      });

      return updatedProjectResult;
    });

    return apiResponse(true, updatedProject, "Data berhasil diperbarui", 200);
  } catch (error: unknown) {
    return handleError(error, "Failed update project");
  }
}

// --- PATCH /api/projects?id=:id ---
export async function PATCH(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const seacrhParams = req.nextUrl.searchParams;
    const id = seacrhParams.get("id");

    if (!id || !isValidUUID(id)) {
      return handleError(null, "Invalid UUID format", 400);
    }

    const { status } = await req.json();

    const parsed = patchProjectSchema.safeParse({ status });

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const updatedProject = await prisma.projects.updateMany({
      where: { id, ownerId },
      data: {
        status: parsed.data.status,
      },
    });
    if (!updatedProject.count) return handleError(null, "Project not found", 404);

    return apiResponse(
      true,
      { id, status: parsed.data.status },
      "Status updated successfully.",
      200
    );
  } catch (error) {
    return handleError(error, "Gagal memperbarui status");
  }
}

// --- DELETE /api/projects?id=:id ---
export async function DELETE(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const seacrhParams = req.nextUrl.searchParams;
    const id = seacrhParams.get("id");

    if (!id) {
      return handleError(null, "UUID is needed.", 400);
    }

    const projectToDelete = await prisma.projects.findFirst({
      where: { id, ownerId },
      select: { photo: true, id: true },
    });

    if (!projectToDelete) {
      return handleError(null, "Project not found", 404);
    }

    const photoUrl = projectToDelete.photo;

    if (photoUrl) {
      const match = photoUrl.match(/\/v\d+\/(.+)\.\w+$/);
      const publicId = match ? match[1] : null;

      if (publicId) {
        try {
          // No need to destroy from Cloudinary here, as the uploadToCloudinary utility handles deletion.
          // await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed remove photo on Cloudinary:", err);
        }
      }
    }

    await prisma.projects.delete({
      where: { id: projectToDelete.id },
    });

    return apiResponse(true, null, "Project deleted successfully.", 200);
  } catch (error) {
    return handleError(error, "Failed delete project");
  }
}
