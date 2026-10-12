"use client";

import Image from "next/image";
import type { TechStackType } from "@/lib/type";

interface TechStackProps {
  data: TechStackType[];
}

export default function TechStack({ data }: TechStackProps) {
  return (
    <section id="techstack-accordion" className="py-16 sm:py-24">
      <div className="mx-5 flex max-w-6xl flex-col font-thin sm:mx-auto sm:mb-20 sm:py-24">
        <div className="mb-16 text-center">
          <div className="my-10 flex items-center">
            <span className="h-px flex-1 bg-gray-300 sm:hidden" />
            <h1 className="px-4 font-mono text-3xl font-semibold text-gray-800 dark:text-white sm:text-5xl">
              Tools &amp; Technologies
            </h1>
            <span className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-lg dark:bg-gray-700 sm:p-8">
            {data.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {data.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left dark:border-gray-600 dark:bg-gray-800"
                  >
                    {typeof tool.image === "string" && tool.image ? (
                      <Image
                        src={tool.image}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 shrink-0 object-contain"
                      />
                    ) : null}
                    <span className="font-medium text-gray-800 dark:text-white">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-gray-500 dark:text-gray-300">
                Belum ada tools dan teknologi.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
