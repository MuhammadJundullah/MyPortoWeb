"use client";
import { useState } from "react";
import Image from "next/image";
import type { EducationsType } from "@/lib/type";

interface EducationsProps {
  data: EducationsType[];
}

export default function Educations({ data }: EducationsProps) {
  const [educations] = useState<EducationsType[]>(data);

  return (
    <section id="Educations">
      <div className="flex max-w-6xl flex-col font-thin sm:mx-auto sm:py-24 sm:mb-20 mx-5">
        <span className="text-2xl flex items-center sm:mb-10">
          <span className="shrink-0 pe-4">
            <h1 className="sm:text-5xl font-mono font-semibold  text-gray-800 dark:text-white">
              Educations
            </h1>
          </span>
          <span className="h-px flex-1 bg-gray-300"></span>
        </span>
        <div className="my-12 sm:mx-auto mx-2 w-full max-w-4xl">
          {educations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300 text-center">No education history to display yet.</p>
          ) : (
            <ol className="space-y-8">
              {educations.map((education, index) => (
                <li key={`${education.school}-${index}`} className="relative flex gap-5 pl-8">
                  {index < educations.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[5px] top-1.5 h-[calc(100%+2rem)] w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span aria-hidden="true" className="absolute left-0 top-1.5 size-3 rounded-full bg-gray-800 dark:bg-white" />
                  <Image
                    src={education.name}
                    alt={`${education.school} logo`}
                    width={72}
                    height={72}
                    unoptimized
                    className="size-14 shrink-0 rounded-full border border-gray-200 bg-white object-contain p-1 sm:size-[72px]"
                  />
                  <div className="min-w-0 pb-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white sm:text-2xl">
                      {education.school}
                    </h3>
                    <p className="mt-1 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                      {education.major}
                    </p>
                    <time className="mt-1 block text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                      {education.date}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
