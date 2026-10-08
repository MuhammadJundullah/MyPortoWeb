// app/portofolio/[id]/page.tsx
import React from "react";
import Link from "next/link";
import { fetchDataFromAPI } from "@/lib/actions";
import Image from "next/image";
import {
  FaArrowLeft,
  FaGithub,
  FaMobile,
  FaGooglePlay,
  FaAppStore,
} from "react-icons/fa";
import { ProjectsType } from "@/lib/type";
import { notFound } from "next/navigation";

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ username?: string }>;
}) {
  const { id } = await params;
  const { username } = await searchParams;

  const res = await fetchDataFromAPI(id, username);
  const data: ProjectsType[] = res.data;

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

  // Check if links are Play Store or App Store
  const isPlayStore = item.site?.includes("play.google.com");
  const isAppStore = item.site?.includes("apps.apple.com");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 sm:rounded-xl sm:my-10">
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
          {/* Left Column - Project Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {item.judul}
              </h1>
            </div>

            {/* App Screenshot */}
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-blue-400/10 z-10" />
                <Image
                  src={
                    typeof item.photo === "string"
                      ? item.photo
                      : "/placeholder.jpg"
                  }
                  alt={`${item.judul} mobile app screenshot`}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
              {/* Mockup frame for mobile */}
              <div className="absolute -inset-4 border border-gray-300/50 dark:border-gray-600/50 rounded-3xl pointer-events-none hidden sm:block" />
            </div>

            {/* Project Description */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                About This App
              </h2>
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.desc }}
              />
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tech Stack */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tech.split(",").map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Links */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Project Links
                </h3>
                <div className="space-y-4">
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

                  {/* App Store Links */}
                  {item.site && item.site !== "#" && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Download
                      </p>
                      <div className="space-y-2">
                        {isPlayStore && (
                          <a
                            href={item.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200 border border-green-200 dark:border-green-800">
                            <FaGooglePlay className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                Google Play
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Android app
                              </div>
                            </div>
                          </a>
                        )}
                        {isAppStore && (
                          <a
                            href={item.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200">
                            <FaAppStore className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                App Store
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                iOS app
                              </div>
                            </div>
                          </a>
                        )}
                        {!isPlayStore && !isAppStore && (
                          <a
                            href={item.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 border border-blue-200 dark:border-blue-800">
                            <FaMobile className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                Live Demo
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Test the app
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
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
    title: `${item.judul} - Mobile App Project`,
    description: cleanDescription,
    openGraph: {
      title: `${item.judul} - Mobile App Project`,
      description: cleanDescription,
      images: typeof item.photo === "string" && item.photo ? [{ url: item.photo }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.judul} - Mobile App Project`,
      description: cleanDescription,
      images: typeof item.photo === "string" && item.photo ? [item.photo] : [],
    },
  };
}
