import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, handleError } from "@/lib/api-utils";

const schema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9_]+$/),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(80),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return handleError(parsed.error.flatten().fieldErrors, "Data pendaftaran tidak valid.", 400);
    const { username, email, password, name } = parsed.data;
    if (["admin", "api", "login", "register", "project", "_next"].includes(username)) {
      return handleError(null, "Username tersebut tidak tersedia.", 400);
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.users.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hash,
        name,
        about: { create: { about: "", what_i_do: "", role: "" } },
      },
      select: { id: true, username: true },
    });
    return apiResponse(true, user, "Akun berhasil dibuat.", 201);
  } catch (error: any) {
    if (error?.code === "P2002") return handleError(null, "Username atau email sudah digunakan.", 409);
    return handleError(error, "Gagal membuat akun.");
  }
}
