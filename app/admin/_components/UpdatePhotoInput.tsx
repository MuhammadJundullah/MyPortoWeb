import React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdatePhotoInputProps {
  id: string;
  label: string;
  name: string;
  image: string | File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  alt: string;
}

const UpdatePhotoInput: React.FC<UpdatePhotoInputProps> = ({
  id,
  label,
  name,
  image,
  onChange,
  accept = "image/*",
  alt,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!(image instanceof File)) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);
  const imageUrl = previewUrl || (typeof image === "string" ? image : null);

  return (
    <div className="grid w-full gap-1.5 dark:text-white">
      <div className="grid w-full gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative mb-3 aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-300">
              <span>Belum ada foto. Pilih gambar untuk mengunggah.</span>
            </div>
          )}
        </div>
      </div>
      <Input
        type="file"
        id={id}
        name={name}
        className="dark:text-white"
        onChange={onChange}
        accept={accept}
      />
      <p className="text-xs text-gray-500 dark:text-gray-300">Foto disimpan ke Cloudinary. Maksimal 2 MB, format JPG atau PNG.</p>
    </div>
  );
};

export default UpdatePhotoInput;
