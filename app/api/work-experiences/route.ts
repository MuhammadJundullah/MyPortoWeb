import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { apiResponse, handleError } from "@/lib/api-utils";
import { getOwnerId, getReadOwnerId } from "@/lib/portfolio-owner";

export async function GET(req: NextRequest) {
  try {
    const ownerId = await getReadOwnerId(req);
    if (ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);
    const { searchParams } = new URL(req.url);
    const skip = searchParams.get("skip");
    const take = searchParams.get("take");

    const experiences = await prisma.experiences.findMany({
      where: { ownerId },
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      orderBy: { id: "desc" },
      select: {
        id: true,
        company_name: true,
        position: true,
        duration: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        jobdesks: {
          select: { description: true },
        },
      },
    });

    const formatted = experiences.map((exp) => ({
      experience_id: exp.id,
      company_name: exp.company_name,
      position: exp.position,
      duration: exp.duration,
      type: exp.type,
      created_at: exp.createdAt,
      updated_at: exp.updatedAt,
      jobdesks: exp.jobdesks,
    }));

    return apiResponse(
      true,
      formatted,
      "Work experiences fetched successfully.",
      200
    );
  } catch (error) {
    return handleError(error, "Failed fetching work experiences");
  }
}

export async function POST(request: NextRequest) {
  const ownerId = await getOwnerId(request);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const body = await request.json();

    // Validasi input
    const { company_name, position, duration, type, jobdesks } = body;

    if (!company_name || !position || !duration || !type) {
      return handleError(
        null,
        "Missing required fields: company_name, position, duration, type",
        400
      );
    }

    // Validasi jobdesks
    if (!jobdesks || !Array.isArray(jobdesks) || jobdesks.length === 0) {
      return handleError(null, "Jobdesks must be a non-empty array", 400);
    }

    // Validasi setiap jobdesk harus punya description
    const invalidJobdesks = jobdesks.some(
      (jd: any) => !jd.description || jd.description.trim() === ""
    );
    if (invalidJobdesks) {
      return handleError(
        null,
        "Each jobdesk must have a valid description",
        400
      );
    }

    // Create experience dengan jobdesks sekaligus menggunakan transaction
    const newExperience = await prisma.$transaction(async (tx) => {
      // Create experience terlebih dahulu
      const experience = await tx.experiences.create({
        data: {
          company_name,
          position,
          duration,
          type,
          ownerId,
        },
      });

      // Create jobdesks yang terhubung dengan experience
      await tx.jobdesk.createMany({
        data: jobdesks.map((jd: { description: string }) => ({
          experiences_id: experience.id,
          description: jd.description,
        })),
      });

      // Fetch experience dengan jobdesks
      return await tx.experiences.findUnique({
        where: { id: experience.id },
        select: {
          id: true,
          company_name: true,
          position: true,
          duration: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          jobdesks: {
            select: { description: true },
          },
        },
      });
    });

    if (!newExperience) {
      throw new Error("Failed to create experience");
    }

    const formatted = {
      experience_id: newExperience.id,
      company_name: newExperience.company_name,
      position: newExperience.position,
      duration: newExperience.duration,
      type: newExperience.type,
      created_at: newExperience.createdAt,
      updated_at: newExperience.updatedAt,
      jobdesks: newExperience.jobdesks,
    };

    return apiResponse(
      true,
      formatted,
      "Work experience created successfully.",
      201
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return handleError(error, "Duplicate entry detected", 409);
      }
    }
    return handleError(error, "Failed creating work experience");
  }
}

export async function PUT(request: NextRequest) {
  const ownerId = await getOwnerId(request);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const body = await request.json();

    // Validasi input
    const { experience_id, company_name, position, duration, type, jobdesks } =
      body;

    if (!experience_id) {
      return handleError(null, "Missing required field: experience_id", 400);
    }

    if (!company_name || !position || !duration || !type) {
      return handleError(
        null,
        "Missing required fields: company_name, position, duration, type",
        400
      );
    }

    // Validasi jobdesks jika ada
    if (jobdesks && (!Array.isArray(jobdesks) || jobdesks.length === 0)) {
      return handleError(
        null,
        "Jobdesks must be a non-empty array if provided",
        400
      );
    }

    // Validasi setiap jobdesk harus punya description
    if (jobdesks) {
      const invalidJobdesks = jobdesks.some(
        (jd: any) => !jd.description || jd.description.trim() === ""
      );
      if (invalidJobdesks) {
        return handleError(
          null,
          "Each jobdesk must have a valid description",
          400
        );
      }
    }

    // Cek apakah experience exists
    const existingExperience = await prisma.experiences.findFirst({
      where: { id: experience_id, ownerId },
    });

    if (!existingExperience) {
      return handleError(null, "Work experience not found", 404);
    }

    // Update experience dengan jobdesks menggunakan transaction
    const updatedExperience = await prisma.$transaction(async (tx) => {
      // Update experience data
      await tx.experiences.update({
        where: { id: experience_id },
        data: {
          company_name,
          position,
          duration,
          type,
          updatedAt: new Date(),
        },
      });

      // Update jobdesks jika ada
      if (jobdesks) {
        // Delete jobdesks lama
        await tx.jobdesk.deleteMany({
          where: { experiences_id: experience_id },
        });

        // Create jobdesks baru
        await tx.jobdesk.createMany({
          data: jobdesks.map((jd: { description: string }) => ({
            experiences_id: experience_id,
            description: jd.description,
          })),
        });
      }

      // Fetch experience dengan jobdesks terbaru
      return await tx.experiences.findUnique({
        where: { id: experience_id },
        select: {
          id: true,
          company_name: true,
          position: true,
          duration: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          jobdesks: {
            select: { description: true },
          },
        },
      });
    });

    if (!updatedExperience) {
      throw new Error("Failed to update experience");
    }

    const formatted = {
      experience_id: updatedExperience.id,
      company_name: updatedExperience.company_name,
      position: updatedExperience.position,
      duration: updatedExperience.duration,
      type: updatedExperience.type,
      created_at: updatedExperience.createdAt,
      updated_at: updatedExperience.updatedAt,
      jobdesks: updatedExperience.jobdesks,
    };

    return apiResponse(
      true,
      formatted,
      "Work experience updated successfully.",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return handleError(error, "Work experience not found", 404);
      }
    }
    return handleError(error, "Failed updating work experience");
  }
}

export async function DELETE(request: NextRequest) {
  const ownerId = await getOwnerId(request);
  if (!ownerId) return handleError(null, "Unauthorized", 401);
  try {
    const { searchParams } = new URL(request.url);
    const experience_id = searchParams.get("experience_id");
    const jobdesk_id = searchParams.get("jobdesk_id");

    // Case 1: Delete specific jobdesk
    if (jobdesk_id) {
      const jobdeskIdNum = parseInt(jobdesk_id);

      if (isNaN(jobdeskIdNum)) {
        return handleError(null, "Invalid jobdesk_id format", 400);
      }

      // Cek apakah jobdesk exists
      const existingJobdesk = await prisma.jobdesk.findFirst({
        where: { id: jobdeskIdNum, experiences: { ownerId } },
        include: { experiences: true },
      });

      if (!existingJobdesk) {
        return handleError(null, "Jobdesk not found", 404);
      }

      // Delete jobdesk
      await prisma.jobdesk.delete({
        where: { id: jobdeskIdNum },
      });

      return apiResponse(
        true,
        {
          deleted_jobdesk_id: jobdeskIdNum,
          experience_id: existingJobdesk.experiences_id,
        },
        "Jobdesk deleted successfully.",
        200
      );
    }

    // Case 2: Delete entire work experience
    if (experience_id) {
      const experienceIdNum = parseInt(experience_id);

      if (isNaN(experienceIdNum)) {
        return handleError(null, "Invalid experience_id format", 400);
      }

      // Cek apakah experience exists
      const existingExperience = await prisma.experiences.findFirst({
        where: { id: experienceIdNum, ownerId },
        include: {
          jobdesks: true,
        },
      });

      if (!existingExperience) {
        return handleError(null, "Work experience not found", 404);
      }

      // Delete experience (jobdesks akan terhapus otomatis karena onDelete: Cascade)
      await prisma.experiences.delete({
        where: { id: experienceIdNum },
      });

      return apiResponse(
        true,
        {
          deleted_experience_id: experienceIdNum,
          deleted_jobdesks_count: existingExperience.jobdesks.length,
        },
        "Work experience deleted successfully.",
        200
      );
    }

    // Case 3: No parameter provided
    return handleError(
      null,
      "Missing required parameter: experience_id or jobdesk_id",
      400
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return handleError(error, "Data not found", 404);
      }
    }
    return handleError(error, "Failed deleting data");
  }
}
