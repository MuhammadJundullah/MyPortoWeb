"use client";

import Link from "next/link";
import { aboutType } from "@/lib/type";

interface props {
  data: aboutType;
  email: string;
  phone: string;
}

const About = ({ data, email, phone }: props) => {
  return (
    <section id="about">
      <div className="flex flex-col max-w-6xl mb-20 sm:mx-auto mx-5 font-thin sm:text-center text-gray-800">
        <div className="text-3xl mt-10 mb-20 pb-20">
          <span className="flex items-center sm:my-10 my-5">
            <span className="shrink-0 pe-4">
              <h1 className="sm:text-6xl text-3xl font-mono font-semibold text-black dark:text-white sm:mx-0">
                About Me
              </h1>
            </span>
            <span className="h-px flex-1 bg-gray-300"></span>
          </span>

          <div className="sm:mx-0 shadow-lg sm:p-10 p-5 rounded-3xl border-1 border-gray-200">
            <p className="leading-normal sm:text-3xl text-lg text-black dark:text-white sm:font-light font-normal">
              {data.about}
            </p>
            <div className="sm:my-20 text-xl">
              <span className="flex items-center my-5 max-w-xl mx-auto">
                <span className="shrink-0 pe-4">
                  <h1 className="sm:text-5xl text-2xl font-mono font-semibold text-black dark:text-white rounded-xl px-7 py-2">
                    What i do
                  </h1>
                </span>
                <span className="text-xl h-px flex-1 bg-gray-300"></span>
              </span>
              <p className="leading-normal text-black dark:text-white sm:text-3xl text-lg sm:font-light font-normal hover:cursor-pointer ">
                {data.what_i_do}
                <br />
                <br />
                <Link
                  href={`mailto:${email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-white hover:underline">
                  Feel free to reach out via email
                </Link>
                {phone && <> or{" "}<Link
                  href={`https://api.whatsapp.com/send/?phone=${phone.replace(/\D/g, "")}&text&type=phone_number&app_absent=0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-white hover:underline">
                  WhatsApp
                </Link></>}
                . Let’s connect and create something great together!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
