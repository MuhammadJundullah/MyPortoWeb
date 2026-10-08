declare global {
  namespace NodeJS {
    interface Global {
      prisma: any;
    }
  }
}

export type UserType = {
  id: number;
  username: string;
  password: string;
};

export type JobdeskType = {
  description: string;
};

export type WorkExperienceType = {
  experience_id: string;
  company_name: string;
  position: string;
  duration: string;
  type: string;
  jobdesks: JobdeskType[];
};

export type ProjectsType = {
  id: string;
  judul: string;
  slug: string;
  category: string;
  categoryslug: string;
  url: string;
  photo?: File | string | null;
  tech: string;
  site: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
  status: "published" | "archived";
};

export type ApiResponse = ProjectsType[] | { message: string } | null;

export type CertificatesType = {
  id: string;
  name: string;
  desc: string;
  date: string;
  site: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
  status: "published" | "archived";
};

export type EducationsType = {
  name: string;
  school: string;
  major: string;
  date: string;
};

export type TechStackType = {
  id: string;
  name: string;
  description: string;
  image?: File | string;
  createdAt: string;
  updatedAt: string;
};

export type aboutType = {
  id: string;
  about: string;
  what_i_do: string;
  role: string;
};
