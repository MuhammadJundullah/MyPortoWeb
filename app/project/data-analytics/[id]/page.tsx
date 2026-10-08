import React from "react";
import Link from "next/link";
import { fetchDataFromAPI } from "@/lib/actions";
import { FaArrowLeft, FaGithub } from "react-icons/fa";
import { notFound } from "next/navigation";

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ username?: string }>;
}) {
  const { id } = await params;
  const { username } = await searchParams;
  const res = await fetchDataFromAPI(id, username);
  const data = res.data;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 sm:rounded-xl sm:my-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href={username ? "/" + username + "#projects" : "/#projects"}
            className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 group">
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Projects</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {item.judul}
              </h1>
            </div>

            {/* Project Description */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                Project Overview
              </h2>
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.desc }}
              />
            </div>
          </div>

          {/* Right Column - Project Metadata */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tech Stack */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {/* <FaPython className="w-5 h-5 text-blue-500" /> */}
                  Tools & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tech.split(",").map((tech: any, index: any) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {/* <FaDatabase className="w-5 h-5 text-purple-500" /> */}
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Category
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {item.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Notebook
                    </p>
                    {item.url && item.url !== "#" ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        <FaGithub className="w-4 h-4" />
                        <span className="truncate">Open Jupyter Notebook</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">
                        Not Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Embedded Content */}
        {item.site && item.site !== "#" && (
          <div className="sm:block hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm my-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              Dashboard Visualizations
            </h2>
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div
                className="w-full min-h-[400px] bg-white dark:bg-gray-900"
                dangerouslySetInnerHTML={{ __html: item.site }}
              />
            </div>
          </div>
        )}
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
    title: `${item.judul} - Data Analysis Project`,
    description: cleanDescription,
    openGraph: {
      title: `${item.judul} - Data Analysis Project`,
      description: cleanDescription,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${item.judul} - Data Analysis Project`,
      description: cleanDescription,
    },
  };
}
