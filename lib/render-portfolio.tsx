import Hello from "@/app/_sections/Hello";
import About from "@/app/_sections/About";
import WorkExperiences from "@/app/_sections/WorkExperiences";
import Projects from "@/app/_sections/Projects";
import Certificates from "@/app/_sections/Certificates";
import Education from "@/app/_sections/Education";
import TechStack from "@/app/_sections/TechStack";
import prisma from "@/lib/prisma";
import type { CertificatesType, ProjectsType } from "@/lib/type";
import Footer from "@/app/_sections/Footer";
import { getPortfolioLastUpdated } from "@/lib/portfolio-last-updated";

export async function RenderPortfolio({ ownerId, username }: { ownerId: number | null; username?: string }) {
  const [profile, about, experiences, projects, techstacks, certificates, educations, lastUpdated] = await Promise.all([
    ownerId ? prisma.users.findUnique({ where: { id: ownerId }, select: { name: true, photo: true, email: true, phone: true, instagram: true, twitter: true, linkedin: true, github: true } }) : Promise.resolve(null),
    prisma.about.findFirst({ where: { ownerId }, orderBy: { id: "asc" } }),
    prisma.experiences.findMany({ where: { ownerId }, orderBy: { id: "desc" }, include: { jobdesks: { select: { description: true } } } }),
    prisma.projects.findMany({ where: { ownerId, status: "published" }, orderBy: [{ status: "desc" }, { judul: "asc" }] }),
    prisma.techStack.findMany({ where: { ownerId }, orderBy: { name: "asc" } }),
    prisma.certificates.findMany({ where: { ownerId, status: "published" }, orderBy: { status: "desc" } }),
    prisma.educations.findMany({ where: { ownerId }, orderBy: { id: "desc" } }),
    getPortfolioLastUpdated(ownerId),
  ]);

  return <>
    <Hello data={{ role: about?.role || "", name: profile?.name || "Sayid Muhammad Jundullah", photo: profile?.photo || null, linkedin: profile?.linkedin, github: profile?.github }} />
    <About data={{ id: about ? String(about.id) : "", about: about?.about || "", what_i_do: about?.what_i_do || "", role: about?.role || "" }} email={profile ? (profile.email || "") : "sayidmuhammad15@gmail.com"} phone={profile ? (profile.phone || "") : "628385329175"} />
    <WorkExperiences data={experiences.map((experience) => ({ experience_id: String(experience.id), company_name: experience.company_name, position: experience.position, duration: experience.duration, type: experience.type, jobdesks: experience.jobdesks }))} />
    <Projects data={projects.map((project) => ({ ...project, url: project.url || "", photo: project.photo, tech: project.tech || "", site: project.site || "", desc: project.desc || "", slug: "", categoryslug: "", createdAt: project.createdAt?.toISOString() || "", updatedAt: project.updatedAt?.toISOString() || "", status: project.status === "published" ? "published" : "archived" } as ProjectsType))} username={username} />
    <TechStack data={techstacks.map((tool) => ({ ...tool, id: String(tool.id), image: tool.image || undefined, description: tool.description || "", createdAt: tool.createdAt?.toISOString() || "", updatedAt: tool.updatedAt?.toISOString() || "" }))} />
    <Certificates data={certificates.map((certificate) => ({ ...certificate, id: String(certificate.id), desc: certificate.desc || "", site: certificate.site || "", photo: certificate.photo || "", status: certificate.status === "published" ? "published" : "archived", createdAt: certificate.createdAt?.toISOString() || "", updatedAt: certificate.updatedAt?.toISOString() || "" } as CertificatesType))} />
    <Education data={educations} />
    <div className="sm:w-full sm:mx-0 mx-5"><Footer name={profile?.name || "Sayid"} instagram={profile?.instagram || undefined} twitter={profile?.twitter || undefined} lastUpdated={lastUpdated} /></div>
  </>;
}
