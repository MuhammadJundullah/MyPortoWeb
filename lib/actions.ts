import prisma from "@/lib/prisma";
import type { ProjectsType } from "@/lib/type";

export const fetchDataFromAPI = async (id: string, username?: string): Promise<{ data: ProjectsType[]; upworkUrl: string | null }> => {
  const owner = username
    ? await prisma.users.findUnique({ where: { username: username.toLowerCase() }, select: { id: true, upwork: true } })
    : null;
  if (username && !owner) return { data: [], upworkUrl: null };
  const project = await prisma.projects.findFirst({
    where: { id, ownerId: owner?.id ?? null, status: "published" },
  });
  return {
    data: project ? [{
      id: project.id,
      judul: project.judul,
      slug: "",
      category: project.category,
      categoryslug: "",
      url: project.url || "",
      photo: project.photo,
      tech: project.tech || "",
      site: project.site || "",
      desc: project.desc || "",
      createdAt: project.createdAt?.toISOString() || "",
      updatedAt: project.updatedAt?.toISOString() || "",
      status: "published",
    }] : [],
    upworkUrl: owner?.upwork || null,
  };
};
