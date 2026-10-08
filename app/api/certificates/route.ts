import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, handleError } from "@/lib/api-utils";
import { getOwnerId, getReadOwnerId } from "@/lib/portfolio-owner";

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} else {
  console.error("CLOUDINARY_URL environment variable is required");
}

const certificateSchema = z.object({
  name: z.string().min(1, "Name wajib diisi"),
  desc: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal tidak valid",
  }),
  site: z.string().url("URL tidak valid"),
  status: z.string().nullable().optional(),
});

const patchCertificateSchema = z.object({
  status: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const ownerId = await getReadOwnerId(req);
    if (ownerId === undefined) return handleError(null, "Portfolio tidak ditemukan.", 404);
    const viewerOwnerId = await getOwnerId(req);

    const certificates = await prisma.certificates.findMany({
      where: { ownerId, status: ownerId !== null && viewerOwnerId === ownerId ? (status || undefined) : "published" },
      orderBy: [
        {
          status: "desc",
        },
      ],
    });

    return apiResponse(
      true,
      certificates,
      "Certificates fetched successfully",
      200
    );
  } catch (error) {
    return handleError(error, "Error fetching data certifications");
  }
}

export async function POST(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString() || "";
    const desc = formData.get("desc")?.toString() || "";
    const date = formData.get("date")?.toString() || "";
    const site = formData.get("site")?.toString() || "";
    const status = formData.get("status")?.toString() || null;

    const parsed = certificateSchema.safeParse({ name, desc, date, site, status });

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const photo = formData.get("photo");

    let photoUrl: string | null = null;

    if (photo instanceof File && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "/portofolio/certificates" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      photoUrl = (uploadResult as any).secure_url || "default";
    }

    const newCertificate = await prisma.certificates.create({
      data: {
        name: name,
        desc: desc,
        site: site,
        date: date,
        photo: photoUrl,
        status: status,
        ownerId,
      },
    });

    return apiResponse(
      true,
      newCertificate,
      "Certificate created successfully.",
      201
    );
  } catch (error) {
    return handleError(error, "Error creating certificate");
  }
}

export async function DELETE(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const seacrhParams = req.nextUrl.searchParams;
    const idParam = seacrhParams.get("id");

    if (!idParam) {
      return handleError(null, "Need ID.", 400);
    }

    const certificateId = parseInt(idParam);
    if (isNaN(certificateId)) {
      return handleError(null, "Invalid ID.", 400);
    }

    const certificateToDelete = await prisma.certificates.findFirst({
      where: { id: certificateId, ownerId },
      select: {
        id: true,
        photo: true,
      },
    });

    if (!certificateToDelete) {
      return handleError(null, "Certificate not found.", 404);
    }

    const photoUrl = certificateToDelete.photo;

    if (photoUrl) {
      const match = photoUrl.match(/\/v\d+\/(.+)\.\w+$/);
      const publicId = match ? match[1] : null;

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Gagal hapus foto dari Cloudinary:", err);
        }
      }
    }

    const deletedCertificate = await prisma.certificates.delete({ where: { id: certificateId } });

    return apiResponse(
      true,
      deletedCertificate,
      "Certificate deleted successfully.",
      200
    );
  } catch (error) {
    return handleError(error, "Failed deleted certificate");
  }
}

export async function PUT(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return handleError(null, "ID is required in query parameters.", 400);
    }

    const data = await req.json();

    const parsed = certificateSchema.safeParse(data);

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const certificateId = parseInt(id);
    const existing = await prisma.certificates.findFirst({ where: { id: certificateId, ownerId } });
    if (!existing) return handleError(null, "Certificate not found.", 404);
    const certificate = await prisma.certificates.update({ where: { id: certificateId }, data: parsed.data });

    return apiResponse(true, certificate, "Certificate updated successfully.", 200);
  } catch (err) {
    return handleError(err, "Error updating certificate");
  }
}

export async function PATCH(req: NextRequest) {
  const ownerId = await getOwnerId(req);
  if (!ownerId) {
    return handleError(null, "Unauthorized", 401);
  }

  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return handleError(null, "ID is required in query parameters.", 400);
    }

    const data = await req.json();

    const parsed = patchCertificateSchema.safeParse(data);

    if (!parsed.success) {
      return handleError(parsed.error.flatten().fieldErrors, "Invalid input", 400);
    }

    const certificateId = parseInt(id);
    const existing = await prisma.certificates.findFirst({ where: { id: certificateId, ownerId } });
    if (!existing) return handleError(null, "Certificate not found.", 404);
    const certificate = await prisma.certificates.update({ where: { id: certificateId }, data: parsed.data });

    return apiResponse(
      true,
      certificate,
      "Certificate status updated successfully.",
      200
    );
  } catch (err) {
    return handleError(err, "Error updating certificate status");
  }
}



