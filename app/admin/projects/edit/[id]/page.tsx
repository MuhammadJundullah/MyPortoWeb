"use client";

import { useEffect, useState, use } from "react";
import Loading from "@/app/_components/Loading";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import BackButton from "@/app/admin/_components/BackButton";
import TextInput from "@/app/admin/_components/TextInput";
import SelectInput from "@/app/admin/_components/SelectInput";
import TextAreaInput from "@/app/admin/_components/TextAreaInput";
import { ProjectsType } from "@/lib/type";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import UpdatePhotoInput from "@/app/admin/_components/UpdatePhotoInput";

export default function EditProject({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast, showToast } = useToast();
  const [project, setProject] = useState<ProjectsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = use(params);
  const router = useRouter();
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
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/projects?id=${id}`);

        if (!res.ok) throw new Error("Failed to fetch project");

        const data = await res.json();

        setProject(data.data[0]);
      } catch (error) {
        console.error("Error fetching project:", error);
        router.push("/error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen mx-10  w-7xl">
        <Loading />
      </div>
    );
  }

  if (!project) {
    return <div className="dark:text-white">Project not found</div>;
  }

  // handle file (photo) change state
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 2 * 1024 * 1024;

      if (file.size > maxSize) {
        showToast("Ukuran file maksimal adalah 2 MB.", "error");
        // Anda bisa menambahkan logika lain di sini, seperti mengosongkan input file
        e.target.value = "";
      } else {
        setProject((prev) => (prev ? { ...prev, photo: file } : prev));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProject((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProject((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    try {
      setIsLoading(true);
      const formData = new FormData();

      // Append semua field text
      formData.append("judul", project.judul);
      formData.append("desc", project.desc || "");
      formData.append("status", project.status || "");
      formData.append("url", project.url || "");
      formData.append("tech", project.tech || "");
      formData.append("site", project.site || "");

      // Append file hanya jika itu File object (foto baru)
      if (project.photo instanceof File) {
        formData.append("photo", project.photo);
      }

      const res = await fetch(`/api/projects?id=${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setIsLoading(false);
        showToast("Project has been updated successfully!", "success");
      } else {
        const errorData = await res.json();
        setIsLoading(false);
        showToast(errorData.message, "success");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      alert("Terjadi kesalahan saat mengupdate project");
    }
  };

  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-4 py-6 text-black sm:px-6">
      <div>
        <BackButton href="/admin/projects" />
      </div>

      <form className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <div className="flex flex-col gap-8 dark:text-white">
          <TextInput
            id="judul"
            label="Nama Proyek"
            type="text"
            name="judul"
            value={project.judul}
            onChange={handleChange}
            placeholder="Nama Proyek"
            required
          />

          <UpdatePhotoInput
            id="photo"
            label="Ubah Foto"
            name="imaphotoge"
            image={project.photo || null}
            onChange={handleFileChange}
            alt="Project Photo"
          />

          <SelectInput
            id="status"
            label="Status"
            name="status"
            value={project.status}
            onChange={handleChange}
            options={statusOptions}
            placeholder="Pilih status"
            required
          />

          <TextAreaInput
            id="desc"
            label="Description (bisa pakai tag HTML)"
            name="desc"
            value={project.desc}
            onChange={handleTextareaChange}
            placeholder="Project Description."
            required
          />
        </div>
        <SubmitButton label="Simpan Perubahan" onClick={handleSubmit} />
      </form>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
