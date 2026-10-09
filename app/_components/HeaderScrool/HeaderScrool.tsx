"use client";

import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";
import { PiGithubLogoLight } from "react-icons/pi";
import { useEffect, useState } from "react";

const HeaderScroll = ({ name, linkedin, github }: { name: string; linkedin?: string | null; github?: string | null }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      if (window.scrollY > scrollThreshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`
        flex flex-row justify-between fixed top-4 left-1/2 -translate-x-1/2 sm:text-3xl text-lg font-bold sm:w-6xl w-xs z-1 text-gray-500 dark:text-white dark:bg-gray-900 rounded-4xl px-7 items-center sm:mx-0 mx-3 sm:py-6 py-3 transition-all duration-300
        ${
          scrolled
            ? "bg-gray-600/70 text-white backdrop-blur-xl blur-3xl opacity-0 hover:opacity-100 hover:blur-none duration-500"
            : "bg-gray-300/70"
        }
      `}>
      <a href="#hello">
        {" "}
        <p className="sm:tracking-[.30em]">{name}&apos;s Portfolio</p>
      </a>
      <div className="flex flex-row sm:space-x-10 space-x-4">
        {linkedin && <Link
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors">
          <FaLinkedin />
        </Link>}
        {github && <Link
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-whitetransition-colors">
          <PiGithubLogoLight />
        </Link>}
      </div>
    </div>
  );
};

export default HeaderScroll;
