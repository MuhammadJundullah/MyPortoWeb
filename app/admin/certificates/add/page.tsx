"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import Loading from "@/app/_components/Loading";
import BackButton from "@/app/admin/_components/BackButton";
import TextInput from "@/app/admin/_components/TextInput";
import PhotoUpload from "@/app/admin/_components/PhotoUpload";
import DateInput from "../../_components/DateInput";
import SelectInput from "../../_components/SelectInput";
import SubmitButton from "../../_components/SubmitButton";

export default function AddCertificate() {
  const { toast, showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submitRef.current?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [certificate, setCertificate] = useState({
    name: "",
    desc: "",
    date: "",
    photo: null as File | null,
    status: "",
    site: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 2 * 1024 * 1024; // 2 MB dalam bytes

      if (file.size > maxSize) {
        showToast("Ukuran file maksimal adalah 2 MB.", "error");
        // Anda bisa menambahkan logika lain di sini, seperti mengosongkan input file
        e.target.value = "";
      } else {
        setCertificate((prev) => ({ ...prev, photo: e.target.files![0] }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCertificate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm("Apakah Anda yakin ingin menambahkan sertifikat?")) {
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append("name", certificate.name);
      formData.append("desc", certificate.desc);
      formData.append("date", certificate.date);
      formData.append("site", certificate.site);
      formData.append("status", certificate.status);

      if (certificate.photo) {
        formData.append("photo", certificate.photo);
      }

      const response = await fetch(`/api/certificates`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal membuat certificate");
      }

      setIsLoading(false);
      showToast("Sertifikat berhasil ditambahkan.", "success");
      setCertificate({
        name: "",
        desc: "",
        photo: null,
        date: "",
        site: "",
        status: "",
      });
    } catch {
      setIsLoading(false);
      showToast("Gagal menambahkan sertifikat.", "error");
    }
  };

  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <div className="sm:mx-auto sm:w-6xl flex flex-col justify-center text-black">
      <div>
        <BackButton href="/admin/projects" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen w-full">
          <Loading />
        </div>
      ) : (
        <form className="py-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-8">
            <TextInput
              id="name"
              label="Nama Sertifikat"
              type="text"
              name="name"
              value={certificate.name}
              onChange={handleChange}
              placeholder="Udemy Certification"
              required
            />

            <TextInput
              id="desc"
              label="Deskripsi"
              type="text"
              name="desc"
              value={certificate.desc}
              onChange={handleChange}
              placeholder="Learning Data Science, Machine Learning, AI on Telkom University"
              required
            />

            <PhotoUpload
              id="photo"
              label="Foto Sertifikat"
              name="photo"
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              hint="*Hanya format .png atau .jpeg, max. 2 MB"
              required
            />

            <DateInput
              id="certificate-date"
              label="Tanggal sertifikat diperoleh"
              name="date"
              value={certificate.date}
              onChange={handleChange}
              required
            />

            <TextInput
              id="site"
              label="Site (misalnya url verifikasi sertifikat, boleh link drive. dsb)"
              type="text"
              name="site"
              value={certificate.site}
              onChange={handleChange}
              placeholder="http://example.com/certificate.pdf"
              required
            />

            <SelectInput
              id="status"
              label="Status"
              name="status"
              value={certificate.status}
              onChange={handleChange}
              options={statusOptions}
              placeholder="Pilih status"
              required
            />
          </div>

          <SubmitButton label="Tambah Sertifikat" onClick={handleSubmit} />
        </form>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
