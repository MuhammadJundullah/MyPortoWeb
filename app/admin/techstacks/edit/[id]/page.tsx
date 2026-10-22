"use client";

import { useEffect, useState, use } from "react";
import Loading from "@/app/_components/Loading";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { TechStackType } from "@/lib/type";
import TextInput from "@/app/admin/_components/TextInput";
import UpdatePhotoInput from "@/app/admin/_components/UpdatePhotoInput";
import BackButton from "@/app/admin/_components/BackButton";

export default function EditTechStack({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast, showToast } = useToast();
  const [techstack, setTechStack] = useState<TechStackType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = use(params);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Cmd+S (Mac) atau Ctrl+S (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        buttonRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchTechStack = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/techstacks?id=${id}`);

        if (!res.ok) throw new Error("Gagal memuat tool");

        const data = await res.json();

        const tool = Array.isArray(data.data) ? data.data[0] : data.data;
        if (!tool) throw new Error("Tool tidak ditemukan.");
        setTechStack(tool);
      } catch {
        showToast("Gagal memuat data alat dan teknologi.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTechStack();
    }
  }, [id, showToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!techstack) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 dark:text-white sm:px-6">
        <BackButton href="/admin/techstacks" />
        <p>Tool tidak ditemukan.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 2 * 1024 * 1024;

      if (file.size > maxSize) {
        showToast("Ukuran file maksimal adalah 2 MB.", "error");
        // Anda bisa menambahkan logika lain di sini, seperti mengosongkan input file
        e.target.value = "";
      } else {
        setTechStack((prev) => (prev ? { ...prev, image: file } : prev));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTechStack((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!techstack) return;

    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append("name", techstack.name);

      if (techstack.image instanceof File) {
        formData.append("image", techstack.image);
      }

      const res = await fetch(`/api/techstacks?id=${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setIsLoading(false);
        showToast("Alat dan teknologi berhasil diperbarui.", "success");
      } else {
        setIsLoading(false);
        showToast("Gagal memperbarui alat dan teknologi.", "error");
      }
    } catch {
      setIsLoading(false);
      showToast("Terjadi kesalahan saat memperbarui alat dan teknologi.", "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 text-black sm:px-6">
      <BackButton href="/admin/techstacks" />
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold dark:text-white">Edit Tool</h1>
        <div className="flex flex-col gap-6 dark:text-white">
          <TextInput
            id="techstack-name"
            label="Nama tool atau teknologi"
            type="text"
            name="name"
            value={techstack.name}
            onChange={handleChange}
            placeholder="Contoh: Python, Django, JavaScript, Node.js"
            required
          />

          <UpdatePhotoInput
            id="techstack-photo"
            label="Ubah Foto"
            name="image"
            image={techstack.image || "null"}
            onChange={handleFileChange}
            alt={techstack.name}
          />
        </div>
        <SubmitButton ref={buttonRef} label="Simpan Perubahan" onClick={() => {}} />
      </form>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
