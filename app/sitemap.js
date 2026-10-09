import { db } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = 'https://myporfolioo.vercel.app';

  // 1. Ambil seluruh username dari database secara otomatis
  const users = await db.user.findMany({
    select: {
      username: true,
      updatedAt: true,
    },
  });

  // 2. Generate URL untuk setiap user
  const userUrls = users.map((user) => ({
    url: `${baseUrl}/${user.username}`,
    lastModified: user.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Halaman statis utama
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  return [...staticRoutes, ...userUrls];
}
