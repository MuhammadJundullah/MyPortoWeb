import prisma from "@/lib/prisma";

export default async function sitemap() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://myporto.vercel.app");
  const baseUrl = configuredUrl.replace(/\/$/, "");

  const [users, projects] = await Promise.all([
    prisma.users.findMany({
      select: {
        username: true,
        updatedAt: true,
        projects: {
          where: { status: "published" },
          select: { id: true, updatedAt: true },
        },
      },
    }),
    prisma.projects.findMany({
      where: { ownerId: null, status: "published" },
      select: { id: true, updatedAt: true },
    }),
  ]);

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const portfolioRoutes = users.map((user) => ({
    url: `${baseUrl}/${encodeURIComponent(user.username)}`,
    lastModified: user.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const projectRoutes = users.flatMap((user) =>
    user.projects.map((project) => ({
      url: `${baseUrl}/project/${project.id}?username=${encodeURIComponent(user.username)}`,
      lastModified: project.updatedAt || user.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  );

  const defaultProjectRoutes = projects.map((project) => ({
    url: `${baseUrl}/project/${project.id}`,
    lastModified: project.updatedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...portfolioRoutes, ...projectRoutes, ...defaultProjectRoutes];
}
