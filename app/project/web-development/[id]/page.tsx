import React from "react";
import Link from "next/link";
import { fetchDataFromAPI } from "@/lib/actions";
import Image from "next/image";
import { FaArrowLeft, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { FaSquareUpwork } from "react-icons/fa6";
import { ProjectsType } from "@/lib/type";
import { notFound } from "next/navigation";

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ username?: string }>;
}) {
  const { id } = await params;
  const { username } = await searchParams;

  const res = await fetchDataFromAPI(id, username);
  const data: ProjectsType[] = res.data;
  const upworkUrl = res.upworkUrl;

  if (
    !data ||
    (typeof data === "object" &&
      "message" in data &&
      data.message === "Project not found") ||
    (Array.isArray(data) && data.length === 0) ||
    !Array.isArray(data)
  ) {
    notFound();
  }

  const item = data[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 sm:rounded-xl sm:my-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href={username ? "/" + username + "#projects" : "/#projects"}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 group">
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Projects</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {item.judul}
              </h1>
            </div>

            {/* Project Image */}
            <div className="relative group">
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden border-2 border-slate-200/50 dark:border-gray-700/50 shadow-lg">
                {typeof item.photo === "string" && item.photo ? (
                  <Image
                    src={item.photo}
                    alt={item.judul || "Project screenshot"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 text-sm font-medium text-slate-500 dark:from-gray-700 dark:via-gray-800 dark:to-slate-900 dark:text-gray-300">
                    Belum ada foto proyek
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-gray-700/50 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                About This Project
              </h2>
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.desc }}
              />
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tech Stack */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(item.tech || "").split(",").filter(Boolean).map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Links */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  Project Links
                </h3>
                <div className="space-y-3">
                  {/* Live Site */}
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Live Site
                    </p>
                    {item.site && item.site !== "#" ? (
                      <a
                        href={item.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <FaExternalLinkAlt className="w-4 h-4" />
                        <span className="truncate">
                          {item.site.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">
                        Not Available
                      </span>
                    )}
                  </div>

                  {/* Source Code */}
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Source Code
                    </p>
                    {item.url && item.url !== "#" ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <FaGithub className="w-4 h-4" />
                        <span className="truncate">GitHub Repository</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">
                        Not Available
                      </span>
                    )}
                  </div>
                   {upworkUrl && <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Let’s build your next website together! </p>
                      <a
                        href={upworkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <FaSquareUpwork className="w-4 h-4" />
                        <span className="truncate">Hire me on Upwork.</span>
                      </a>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ username?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { username } = await searchParams;
  const { id } = resolvedParams;

  const data = await fetchDataFromAPI(id, username);

  if (!data.data.length) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const item = data.data[0];
  const cleanDescription =
    item.desc.replace(/<[^>]*>/g, "").substring(0, 160) + "...";

  return {
    title: `${item.judul} - Web Development Project`,
    description: cleanDescription,
    openGraph: {
      title: `${item.judul} - Web Development Project`,
      description: cleanDescription,
      images: typeof item.photo === "string" && item.photo ? [{ url: item.photo }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.judul} - Web Development Project`,
      description: cleanDescription,
      images: typeof item.photo === "string" && item.photo ? [item.photo] : [],
    },
  };
}
