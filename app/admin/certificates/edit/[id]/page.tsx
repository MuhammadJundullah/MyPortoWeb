"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/_components/Loading";
import BackButton from "@/app/admin/_components/BackButton";
import TextInput from "@/app/admin/_components/TextInput";
import TextAreaInput from "@/app/admin/_components/TextAreaInput";
import UpdatePhotoInput from "@/app/admin/_components/UpdatePhotoInput";
import DateInput from "@/app/admin/_components/DateInput";
import SelectInput from "@/app/admin/_components/SelectInput";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { Toast } from "@/app/login/_components/Toast";
import { useToast } from "@/hooks/use-toast";
import type { CertificatesType } from "@/lib/type";

export default function EditCertificate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [certificate, setCertificate] = useState<CertificatesType | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/certificates?id=${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Sertifikat tidak ditemukan");
        const result = await response.json();
        const record = Array.isArray(result.data) ? result.data[0] : result.data;
        if (!record) throw new Error("Sertifikat tidak ditemukan");
        setCertificate({ ...record, date: new Date(record.date).toISOString().slice(0, 10) });
      })
      .catch(() => showToast("Gagal memuat data sertifikat.", "error"))
      .finally(() => setIsLoading(false));
  }, [id, showToast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!certificate) return;
    setIsLoading(true);
    try {
      // Read the submitted values from the form to ensure the latest edits are saved.
      const body = new FormData(event.currentTarget);
      if (photo) body.append("photo", photo);
      const response = await fetch(`/api/certificates?id=${id}`, { method: "PUT", body });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Gagal memperbarui sertifikat");
      }
      showToast("Sertifikat berhasil diperbarui.", "success");
      router.push("/admin/certificates");
    } catch {
      showToast("Gagal memperbarui sertifikat.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !certificate) return <div className="flex h-screen items-center justify-center"><Loading /></div>;
  if (!certificate) return <p className="p-8">Sertifikat tidak ditemukan.</p>;

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCertificate((current) => current ? { ...current, [event.target.name]: event.target.value } : current);
  };
  const statusOptions = [{ value: "published", label: "Published" }, { value: "archived", label: "Archived" }];

  return <div className="mx-auto w-full max-w-6xl px-4 py-6 text-black sm:px-6">
    <BackButton href="/admin/certificates" />
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border p-5 shadow-sm dark:text-white sm:p-8">
      <div className="flex flex-col gap-6">
        <TextInput id="name" label="Nama Sertifikat" type="text" name="name" value={certificate.name} onChange={change} placeholder="Nama sertifikat" required />
        <TextAreaInput id="desc" label="Deskripsi" name="desc" value={certificate.desc} onChange={change} placeholder="Deskripsi sertifikat" required />
        <UpdatePhotoInput id="photo" label="Ubah Foto" name="photo" image={certificate.photo} alt={certificate.name} onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
        <DateInput id="date" label="Tanggal sertifikat diperoleh" name="date" value={certificate.date} onChange={change} required />
        <TextInput id="site" label="Link verifikasi sertifikat" type="url" name="site" value={certificate.site} onChange={change} placeholder="https://example.com" required />
        <SelectInput id="status" label="Status" name="status" value={certificate.status} onChange={change} options={statusOptions} required />
      </div>
      <SubmitButton label="Simpan Perubahan" onClick={() => {}} />
    </form>
    {toast && <Toast message={toast.message} type={toast.type} />}
  </div>;
}
