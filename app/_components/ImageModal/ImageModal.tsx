// app/_components/ImageModal/ImageModal.tsx
"use client";

import React, { useRef, useEffect, useState } from "react"; // Tambahkan useState
import Image from "next/image";
import Link from "next/link";

interface ImageModalProps {
  src: string;
  alt: string;
  site: string | null;
  onClose: () => void;

  originalWidth: number;
  originalHeight: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  site,
  onClose,
  originalWidth,
  originalHeight,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Untuk animasi smooth
  const [imageLoaded, setImageLoaded] = useState(false); // Untuk memastikan gambar sudah load sebelum transisi

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalVisible(false);
        setTimeout(onClose, 300);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalVisible(false);
        setTimeout(onClose, 300);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCloseButtonClick = () => {
    setIsModalVisible(false);
    setTimeout(onClose, 300);
  };

  const modalOverlayClass = `fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 backdrop-filter backdrop-blur-md transition-opacity duration-300 ease-in-out ${
    isModalVisible ? "opacity-100" : "opacity-0"
  }`;

  const maxModalWidth = window.innerWidth * 0.9;
  const maxModalHeight = window.innerHeight * 0.9;

  let displayWidth = originalWidth;
  let displayHeight = originalHeight;

  if (displayWidth > maxModalWidth) {
    displayHeight = (maxModalWidth / displayWidth) * displayHeight;
    displayWidth = maxModalWidth;
  }
  if (displayHeight > maxModalHeight) {
    displayWidth = (maxModalHeight / displayHeight) * displayWidth;
    displayHeight = maxModalHeight;
  }

  const MAX_IMAGE_DISPLAY_WIDTH = 1000;
  const MAX_IMAGE_DISPLAY_HEIGHT = 800;

  if (displayWidth > MAX_IMAGE_DISPLAY_WIDTH) {
    displayHeight = (MAX_IMAGE_DISPLAY_WIDTH / displayWidth) * displayHeight;
    displayWidth = MAX_IMAGE_DISPLAY_WIDTH;
  }
  if (displayHeight > MAX_IMAGE_DISPLAY_HEIGHT) {
    displayWidth = (MAX_IMAGE_DISPLAY_HEIGHT / displayHeight) * displayWidth;
    displayHeight = MAX_IMAGE_DISPLAY_HEIGHT;
  }

  displayWidth = Math.max(100, Math.round(displayWidth));
  displayHeight = Math.max(100, Math.round(displayHeight));

  return (
    <div
      className={modalOverlayClass}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
      {" "}
      <div
        ref={modalRef}
        className={`relative my-auto shrink-0 overflow-y-auto bg-gray-900 rounded-lg shadow-2xl p-4 transition-all duration-300 ease-in-out ${
          isModalVisible ? "scale-100" : "scale-90"
        }`}
        style={{
          width: displayWidth,
          height: "auto",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={displayWidth}
          height={displayHeight}
          onLoad={() => setImageLoaded(true)}
          className={`rounded-lg transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectFit: "contain" }}
        />
        <Link
          className="text-white py-2 hover:underline"
          href={site || "default"}
          target="_blank">
          <h1>More details.</h1>
        </Link>

        <button
          onClick={handleCloseButtonClick}
          className="absolute top-2 right-2 text-white text-4xl font-bold bg-gray-700 bg-opacity-50 hover:bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center leading-none z-10"
          aria-label="Close modal">
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
