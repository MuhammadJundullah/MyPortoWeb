import React from "react";
import Link from "next/link";
import { fetchDataFromAPI } from "@/lib/actions";
import Image from "next/image";
import { FaArrowLeft, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { ProjectsType } from "@/lib/type";
import { notFound } from "next/navigation";

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ username?: string }>;
}) {
  const { id } = await params;
  const { username } = await searchParams;
  const res = await fetchDataFromAPI(id, username);
  const data: ProjectsType[] = res.data;

  // Error handling
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sm:rounded-xl sm:my-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href={username ? "/" + username + "#projects" : "/#projects"}
            className="group flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="ml-2 font-medium">Back to Projects</span>
          </Link>
        </div>

        {/* Project Content */}
        <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 md:h-96">
            <Image
              src={
                typeof item.photo === "string" ? item.photo : "/placeholder.jpg"
              }
              alt={item.judul || "Project image"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {item.judul}
            </h1>

            {/* Description */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.desc }}
              />
            </div>

            {/* Project Details */}
            <div className="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                Project Details
              </h3>

              <div className="space-y-4">
                {/* Live Site */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Live Site
                  </span>
                  {item.site && item.site !== "#" ? (
                    <a
                      href={item.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                      Visit Site
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      Not Available
                    </span>
                  )}
                </div>

                {/* Source Code */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Source Code
                  </span>
                  {item.url && item.url !== "#" ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <FaGithub className="w-4 h-4 mr-2" />
                      View Code
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      Not Available
                    </span>
                  )}
                </div>

                {/* Tech Stack */}
                <div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium block mb-2">
                    Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.tech.split(",").map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
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
    title: `${item.judul} - Project Details`,
    description: cleanDescription,
    openGraph: {
      title: `${item.judul} - My Portfolio Project`,
      description: cleanDescription,
      images: typeof item.photo === "string" && item.photo ? [{ url: item.photo }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.judul} - My Portfolio Project`,
      description: cleanDescription,
      images: typeof item.photo === "string" && item.photo ? [item.photo] : [],
    },
  };
}
