"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import type { ProjectsType } from "@/lib/type";
import CustomAnimatedContent from "@/app/_components/AnimatedContent/CustomAnimateContent";

interface Props {
  data: ProjectsType[];
  username?: string;
}

export default function Projects({ data, username }: Props) {
  const [projects] = useState<ProjectsType[]>(data);

  return (
    <section id="projects">
      <div className="py-20 flex flex-col sm:mx-auto mx-5 font-thin text-center text-[#0f172a] sm:w-6xl">
        <span className="flex items-center">
          <span className="shrink-0 pe-4">
            <h1 className="sm:text-5xl text-2xl font-mono font-semibold text-gray-800 dark:text-white">
              My Projects Experience
            </h1>
          </span>
          <span className="h-px flex-1 bg-gray-300"></span>
        </span>

        <div className="sm:my-20 my-8">
          {projects.length === 0 ? (
            <p className="py-10 text-center text-base text-gray-500 dark:text-gray-300">
              No project experiences to display yet.
            </p>
          ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {projects.map((project, i) => {
              const animationDelay = i * 0.01;
              const finalDirection = "vertical";
              const finalDistance = 80;
              return (
                <div key={i}>
                  <Link
                    href={`/project/${project.id}${username ? `?username=${encodeURIComponent(username)}` : ""}`}
                    className="group block">
                    <div className="group-hover:scale-105 transition-all duration-300">
                      <CustomAnimatedContent
                        distance={finalDistance}
                        direction={finalDirection}
                        initialOpacity={0}
                        animateOpacity
                        threshold={0.1}
                        delay={animationDelay}>
                        {/* Modern Card Container */}
                        <div className="relative w-80 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 group-hover:shadow-xl transition-all duration-300">
                          {/* Image Section */}
                          <div className="relative h-48 overflow-hidden">
                            {typeof project.photo === "string" && project.photo ? (
                              <Image
                                src={project.photo}
                                alt={project.judul}
                                height={200}
                                width={320}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 text-sm font-medium text-slate-500 dark:from-gray-700 dark:via-gray-800 dark:to-slate-900 dark:text-gray-300">
                                Belum ada foto proyek
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          </div>

                          {/* Content Section */}
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                              {project.judul}
                            </h3>

                            <div className="flex items-center mb-3">
                              <div className="w-full h-px bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-600 dark:to-gray-600"></div>
                            </div>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {(project.tech || "").split(",").filter(Boolean)
                                .slice(0, 3)
                                .map((tech, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-md">
                                    {tech.trim()}
                                  </span>
                                ))}
                              {(project.tech || "").split(",").filter(Boolean).length > 3 && (
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-md">
                                  +{(project.tech || "").split(",").filter(Boolean).length - 3}
                                </span>
                              )}
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                View Details
                                <FaArrowUpRightFromSquare className="ml-1 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>

                          {/* Hover Effect Border */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-xl transition-all duration-300 pointer-events-none"></div>
                        </div>
                      </CustomAnimatedContent>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
