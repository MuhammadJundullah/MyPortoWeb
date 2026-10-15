import prisma from "@/lib/prisma";

export async function getPortfolioLastUpdated(ownerId: number | null): Promise<Date | null> {
  const [user, about, projects, certificates, experiences, jobdesks, techStacks] =
    await Promise.all([
      ownerId
        ? prisma.users.aggregate({ where: { id: ownerId }, _max: { createdAt: true, updatedAt: true } })
        : Promise.resolve(null),
      prisma.about.aggregate({ where: { ownerId }, _max: { createdAt: true, updatedAt: true } }),
      prisma.projects.aggregate({ where: { ownerId }, _max: { createdAt: true, updatedAt: true } }),
      prisma.certificates.aggregate({ where: { ownerId }, _max: { createdAt: true, updatedAt: true } }),
      prisma.experiences.aggregate({ where: { ownerId }, _max: { createdAt: true, updatedAt: true } }),
      prisma.jobdesk.aggregate({ where: { experiences: { ownerId } }, _max: { createdAt: true, updatedAt: true } }),
      prisma.techStack.aggregate({ where: { ownerId }, _max: { createdAt: true, updatedAt: true } }),
    ]);

  const timestamps = [user, about, projects, certificates, experiences, jobdesks, techStacks]
    .flatMap((record) => record ? [record._max.createdAt, record._max.updatedAt] : [])
    .filter((timestamp): timestamp is Date => timestamp !== null);

  return timestamps.length ? new Date(Math.max(...timestamps.map((timestamp) => timestamp.getTime()))) : null;
}
