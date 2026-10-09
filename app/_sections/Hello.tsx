"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import HeaderScroll from "@/app/_components/HeaderScrool/HeaderScrool";

interface dataType {
  data: { role: string; name: string; photo?: string | null; linkedin?: string | null; github?: string | null };
}

const Hello = (data: dataType) => {
  const BlurText = dynamic(
    () => import("@/app/_components/BlurText/BlurText"),
    {
      ssr: false,
    }
  );

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };
  const initials = data.data.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <section id="hello">
      <div className="relative flex min-h-screen items-center justify-center px-20 py-20 sm:py-24">
        <HeaderScroll name={data.data.name} linkedin={data.data.linkedin} github={data.data.github} />
        <div className="flex w-full max-w-6xl flex-col items-center gap-10 text-center md:flex-row md:gap-16 md:text-left">
          {data.data.photo ? (
            <Image
              src={data.data.photo}
              alt={data.data.name}
              width={200}
              height={200}
              className="h-64 w-56 rounded-2xl bg-white object-cover shadow-lg transition-all duration-300 hover:scale-105 dark:border md:h-96 md:w-72"
            />
          ) : (
            <div
              role="img"
              aria-label={`${data.data.name} profile photo placeholder`}
              className="flex h-64 w-56 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg transition-all duration-300 hover:scale-105 dark:from-slate-800 dark:to-slate-700 md:h-96 md:w-72"
            >
              <span className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/70 bg-white/60 text-4xl font-semibold tracking-widest text-slate-500 dark:border-slate-600/70 dark:bg-slate-900/30 dark:text-slate-200 md:h-44 md:w-44 md:text-6xl">
                {initials || "?"}
              </span>
            </div>
          )}

          <div className="flex max-w-3xl flex-col items-center gap-5 md:items-start">
            <h1 className="rounded-xl py-2 font-light subpixel-antialiased transition-all duration-300 hover:scale-105 dark:text-white">
              <BlurText
                text={`Hello 👋, i am ${data.data.name}${data.data.role ? `, ${data.data.role}` : ""}`}
                delay={150}
                className="text-center text-3xl font-bold md:text-left md:text-4xl"
                animateBy="words"
                direction="top"
              />
            </h1>
            <motion.p
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 4, duration: 1, ease: "easeOut" }}
              className="max-w-2xl text-base font-light text-gray-600 dark:text-white sm:text-lg lg:text-xl">
              Scroll down to discover more about me!
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hello;
