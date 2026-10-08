"use client";

import { useState } from "react";
import type { WorkExperienceType } from "@/lib/type";

interface WorkExperiencesProps {
  data: WorkExperienceType[];
}

export default function WorkExperiences({ data }: WorkExperiencesProps) {
  // Initialize state with the received data
  const [experiences] = useState<WorkExperienceType[]>(data);

  return (
    <section id="work-experiences">
      <div className="flex flex-col max-w-6xl sm:mx-auto mx-5 sm:mb-20">
        <span className="text-3xl flex items-center">
          <span className="shrink-0 pe-4">
            <h1 className="sm:text-5xl text-2xl font-mono font-semi text-gray-800 dark:text-white my-10">
              My Work Experiences
            </h1>
          </span>
          <span className="h-px flex-1 bg-gray-300"></span>
        </span>

        <div className="sm:my-20 mx-2">
          {experiences.length === 0 ? (
            <p className="py-10 text-center text-base text-gray-500 dark:text-gray-300">
              No work experiences to display yet.
            </p>
          ) : (
          <ol className="sm:text-3xl text-xl relative space-y-8 before:absolute before:-ml-px before:h-full before:w-0.5 before:rounded-full before:bg-gray-200 ">
            {experiences.map((exp) => (
              <li
                key={exp.experience_id}
                className="relative -ms-1.5 flex items-start gap-4">
                <span className="size-3 shrink-0 rounded-full bg-gray-800 dark:bg-white"></span>

                <div className="-mt-2">
                  <h3 className="font-bold mb-3 text-gray-600 dark:text-white sm:text-3xl text-lg">
                    {exp.position} at {exp.company_name}
                  </h3>

                  <time className="sm:flex gap-3 font-medium sm:mt-3 text-gray-600 dark:text-white sm:text-3xl text-lg">
                    <p className="sm:w-fit w-2/3 px-2 bg-gray-600 dark:bg-gray-300 sm:px-5 text-center text-white dark:text-black rounded-lg">
                      {exp.type}
                    </p>
                    <span className="sm:block hidden">|</span> {exp.duration}
                  </time>

                  <ul className="space-y-2 list-disc list-inside text-start sm:text-3xl text-lg sm:font-thin mb-16 mt-5 text-gray-700 dark:text-white">
                    {exp.jobdesks.map((job, idx) => (
                      <li key={`${exp.experience_id}-job-${idx}`}>
                        {job.description}
                      </li>
                    ))}
                  </ul>
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
