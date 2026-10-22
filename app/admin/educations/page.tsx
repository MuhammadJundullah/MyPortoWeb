"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import type { EducationsType } from "@/lib/type";

type Education = EducationsType & { id: number };

const blankForm = { school: "", major: "", date: "" };

export default function ManageEducations() {
  const [items, setItems] = useState<Education[]>([]);
  const [form, setForm] = useState(blankForm);
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast, showToast } = useToast();

  async function refresh() {
    const response = await fetch("/api/educations");
    if (!response.ok) throw new Error("Gagal memuat data pendidikan.");
    const result = await response.json();
    setItems(result.data);
  }

  useEffect(() => {
    refresh().catch(() => showToast("Gagal memuat data pendidikan.", "error"));
  }, []);

  function edit(item: Education) {
    setEditing(item.id);
    setForm({ school: item.school, major: item.major, date: item.date });
    setImage(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function reset() {
    setEditing(null);
    setForm(blankForm);
    setImage(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const body = new FormData();
      body.set("school", form.school);
      body.set("major", form.major);
      body.set("date", form.date);
      if (image) body.set("image", image);

      const response = await fetch(
        editing ? `/api/educations?id=${editing}` : "/api/educations",
        { method: editing ? "PUT" : "POST", body }
      );
      if (!response.ok) throw new Error();

      reset();
      await refresh();
      showToast("Data pendidikan berhasil disimpan.", "success");
    } catch {
      showToast("Gagal menyimpan data pendidikan.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Yakin ingin menghapus data pendidikan ini?")) return;

    try {
      const response = await fetch(`/api/educations?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();

      await refresh();
      showToast("Data pendidikan berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus data pendidikan.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 dark:text-white">
      <h1 className="text-3xl font-bold">Kelola Pendidikan</h1>
      <p className="mt-2 text-gray-500">
        Tambah dan kelola pendidikan yang tampil pada portofoliomu.
      </p>

      <form
        ref={formRef}
        onSubmit={submit}
        className="my-8 grid scroll-mt-8 gap-4 rounded-xl border bg-white p-6 text-gray-900 shadow-sm md:grid-cols-2">
        <h2 className="text-xl font-semibold md:col-span-2">
          {editing ? "Edit pendidikan" : "Tambah pendidikan"}
        </h2>
        <Input
          required
          placeholder="Nama sekolah / universitas"
          value={form.school}
          onChange={(event) =>
            setForm({ ...form, school: event.target.value })
          }
        />
        <Input
          required
          placeholder="Jurusan"
          value={form.major}
          onChange={(event) => setForm({ ...form, major: event.target.value })}
        />
        <Input
          required
          placeholder="Periode / tahun"
          value={form.date}
          onChange={(event) => setForm({ ...form, date: event.target.value })}
        />
        <Input
          type="file"
          accept="image/*"
          required={!editing}
          onChange={(event) => setImage(event.target.files?.[0] || null)}
        />
        <div className="flex gap-2 md:col-span-2">
          <Button disabled={busy}>
            {busy
              ? "Menyimpan…"
              : editing
                ? "Simpan perubahan"
                : "Tambah pendidikan"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={reset}>
              Batal
            </Button>
          )}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-center gap-4 rounded-xl border bg-white p-4 text-gray-900">
            <Image
              src={item.name}
              alt="Logo institusi"
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 rounded-full object-contain"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{item.school}</h2>
              <p>
                {item.major} · {item.date}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => edit(item)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost2"
              className="flex items-center gap-2 hover:cursor-pointer text-red-500"
              onClick={() => remove(item.id)}>
              <Delete size={16} />
              Hapus
            </Button>
          </article>
        ))}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
