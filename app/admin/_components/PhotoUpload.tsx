import React from "react";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

// Definisi tipe data untuk props
interface PhotoUploadProps {
  id: string; 
  label: string;
  name: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  accept?: string; 
  hint?: string; 
  required?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  id,
  label,
  name,
  onChange,
  accept = "image/*",
  hint,
  required = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file && file.size <= 2 * 1024 * 1024 ? URL.createObjectURL(file) : null);
    onChange(event);
  };
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);
  return (
    <div className="grid w-full gap-1.5 dark:text-white text-black">
      <Label htmlFor={id}>{label}</Label>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Pratinjau foto proyek" className="aspect-video w-full max-w-2xl rounded-xl border object-cover" />
      ) : (
        <div className="flex aspect-video w-full max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed bg-gray-50 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-300">
          <span>Belum ada foto yang dipilih</span>
        </div>
      )}
      <Input
        type="file"
        id={id}
        name={name}
        onChange={handleChange}
        className="dark:text-white dark:placeholder:text-gray-300"
        accept={accept}
        required={required}
      />
      {hint && <p className="text-gray-500 dark:text-gray-200 text-xs">{hint}</p>}
    </div>
  );
};

export default PhotoUpload;
