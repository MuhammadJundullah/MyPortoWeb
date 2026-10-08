"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import type { EducationsType } from "@/lib/type";
import Image from "next/image";

type Education = EducationsType & { id: number };
const blank = { school: "", major: "", date: "" };

export default function ManageEducations() {
  const [items, setItems] = useState<Education[]>([]);
  const [form, setForm] = useState(blank);
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast, showToast } = useToast();
  async function refresh() { const response = await fetch("/api/educations"); const result = await response.json(); if (response.ok) setItems(result.data); }
  useEffect(() => { refresh().catch(error => showToast(String(error), "error")); }, []);
  function edit(item: Education) { setEditing(item.id); setForm({ school: item.school, major: item.major, date: item.date }); setImage(null); }
  function reset() { setEditing(null); setForm(blank); setImage(null); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const body = new FormData(); body.set("school", form.school); body.set("major", form.major); body.set("date", form.date); if (image) body.set("image", image);
    const response = await fetch(editing ? `/api/educations?id=${editing}` : "/api/educations", { method: editing ? "PUT" : "POST", body });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { showToast(result.message || "Gagal menyimpan pendidikan", "error"); return; }
    reset(); await refresh(); showToast("Pendidikan berhasil disimpan", "success");
  }
  async function remove(id: number) { const response = await fetch(`/api/educations?id=${id}`, { method: "DELETE" }); const result = await response.json(); if (!response.ok) { showToast(result.message || "Gagal menghapus", "error"); return; } await refresh(); }

  return <div className="mx-auto max-w-6xl px-4 py-8 dark:text-white">
    <h1 className="text-3xl font-bold">Manage Educations</h1><p className="mt-2 text-gray-500">Tambah dan kelola pendidikan yang tampil pada portofoliomu.</p>
    <form onSubmit={submit} className="my-8 grid gap-4 rounded-xl border bg-white p-6 text-gray-900 shadow-sm md:grid-cols-2">
      <h2 className="text-xl font-semibold md:col-span-2">{editing ? "Edit pendidikan" : "Tambah pendidikan"}</h2>
      <Input required placeholder="Nama sekolah / universitas" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
      <Input required placeholder="Jurusan" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} />
      <Input required placeholder="Periode / tahun" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      <Input type="file" accept="image/*" required={!editing} onChange={e => setImage(e.target.files?.[0] || null)} />
      <div className="flex gap-2 md:col-span-2"><Button disabled={busy}>{busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah pendidikan"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Batal</Button>}</div>
    </form>
    <div className="grid gap-4 md:grid-cols-2">{items.map(item => <article key={item.id} className="flex items-center gap-4 rounded-xl border bg-white p-4 text-gray-900"><Image src={item.name} alt="Logo institusi" width={64} height={64} unoptimized className="h-16 w-16 rounded-full object-contain" /><div className="min-w-0 flex-1"><h2 className="font-semibold">{item.school}</h2><p>{item.major} · {item.date}</p></div><Button variant="outline" onClick={() => edit(item)}>Edit</Button><Button variant="destructive" onClick={() => remove(item.id)}>Hapus</Button></article>)}</div>
    {toast && <Toast message={toast.message} type={toast.type} />}
  </div>;
}
