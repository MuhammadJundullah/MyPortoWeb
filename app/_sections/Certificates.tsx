"use client";

import { useState } from "react";
import * as React from "react";
import Image from "next/image";
import type { CertificatesType } from "@/lib/type";
import CustomAnimatedContent from "@/app/_components/AnimatedContent/CustomAnimateContent";
import ImageModal from "@/app/_components/ImageModal/ImageModal";

interface CertificatesProps {
  data: CertificatesType[];
}

export default function CertificatesComponent({ data }: CertificatesProps) {
  const [certificates] = useState<CertificatesType[]>(data);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const DEFAULT_CERTIFICATE_WIDTH = 900;
  const DEFAULT_CERTIFICATE_HEIGHT = 700;

  const openModal = (src: string, alt: string, site: string) => {
    setSelectedImage(src);
    setSelectedAlt(alt);
    setSelectedSite(site);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedAlt(null);
    setSelectedSite(null);
  };

  return (
    <section id="certificates">
      <div className="sm:py-40 flex flex-col max-w-6xl sm:mx-auto mx-5 mb-20 font-thin text-center">
        <span className="text-2xl flex items-center">
          <span className="shrink-0 pe-4 ">
            <h1 className="sm:text-5xl font-mono font-semibold text-gray-800 dark:text-white">
              My Certifications
            </h1>
          </span>
          <span className="h-px flex-1 bg-gray-300 "></span>
        </span>
        <div className="my-20 sm:mx-100 mx-10">
          <div className="flex flex-wrap justify-center gap-5">
            {certificates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-300">No certificates to display yet.</p>
            ) : (
              certificates.map((certificate, i) => {
                const animationDistance = 50;
                const animationDelay = i * 0.08;
                const finalDirection = "vertical";
                const finalDistance = animationDistance;

                const imageUrl = `${certificate.photo}`;

                return (
                  <div
                    key={i}
                    className="hover:scale-105 transition-all duration-300 ease-in-out"
                    onClick={() =>
                      openModal(imageUrl, certificate.name, certificate.site)
                    }>
                    <CustomAnimatedContent
                      distance={finalDistance}
                      direction={finalDirection}
                      initialOpacity={0}
                      animateOpacity
                      threshold={0.1}
                      delay={animationDelay}>
                      <div>
                        <Image
                          src={imageUrl}
                          alt={certificate.name}
                          width={345}
                          height={140}
                          className="rounded-lg shadow-lg cursor-pointer"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="mx-auto mt-4 items-center justify-center text-center mb-7">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {certificate.desc}
                          </h3>
                          <time className="text-gray-500 font-medium dark:text-white">
                            {certificate.date}
                          </time>
                        </div>
                      </div>
                    </CustomAnimatedContent>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedImage && selectedAlt && (
        <ImageModal
          src={selectedImage}
          alt={selectedAlt}
          site={selectedSite}
          onClose={closeModal}
          originalWidth={DEFAULT_CERTIFICATE_WIDTH}
          originalHeight={DEFAULT_CERTIFICATE_HEIGHT}
        />
      )}
    </section>
  );
}
