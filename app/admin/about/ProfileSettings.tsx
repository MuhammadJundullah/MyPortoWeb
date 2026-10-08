"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";

type Profile = { username: string; name: string; email: string; phone: string; photo: string | null; instagram: string; twitter: string; linkedin: string; github: string; upwork: string };

export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile>({ username: "", name: "", email: "", phone: "", photo: null, instagram: "", twitter: "", linkedin: "", github: "", upwork: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast, showToast } = useToast();
  const preview = useMemo(() => photo ? URL.createObjectURL(photo) : profile.photo, [photo, profile.photo]);

  useEffect(() => {
    fetch("/api/profile").then((res) => res.json()).then((res) => {
      if (res.data) setProfile({ username: res.data.username || "", name: res.data.name || "", email: res.data.email || "", phone: res.data.phone || "", photo: res.data.photo || null, instagram: res.data.instagram || "", twitter: res.data.twitter || "", linkedin: res.data.linkedin || "", github: res.data.github || "", upwork: res.data.upwork || "" });
    }).catch(() => undefined);
  }, []);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(preview || ""); }, [photo, preview]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget);
    if (photo) form.set("photo", photo);
    const result = await fetch("/api/profile", { method: "PUT", body: form });
    const body = await result.json(); setSaving(false);
    if (!result.ok) { showToast(body.message || "Gagal menyimpan profil", "error"); return; }
    setProfile(body.data); setPhoto(null); showToast("Profil berhasil disimpan", "success");
  }

  return <section className="mb-10 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-700">
    <h2 className="text-2xl font-bold dark:text-white">Identitas Portofolio</h2>
    <p className="mb-5 mt-1 text-sm text-gray-500">Username publik: /{profile.username}</p>
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <label className="font-medium">Nama lengkap<Input name="name" required value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></label>
      <label className="font-medium">Email publik<Input name="email" type="email" required value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></label>
      <label className="font-medium">Nomor WhatsApp<Input name="phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="62812…" /></label>
      <label className="font-medium">Instagram<Input name="instagram" value={profile.instagram} onChange={e => setProfile({ ...profile, instagram: e.target.value })} placeholder="username" /></label>
      <label className="font-medium">X / Twitter<Input name="twitter" value={profile.twitter} onChange={e => setProfile({ ...profile, twitter: e.target.value })} placeholder="username" /></label>
      <label className="font-medium">LinkedIn URL<Input name="linkedin" type="url" value={profile.linkedin} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" /></label>
      <label className="font-medium">GitHub URL<Input name="github" type="url" value={profile.github} onChange={e => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/username" /></label>
      <label className="font-medium">Upwork URL<Input name="upwork" type="url" value={profile.upwork} onChange={e => setProfile({ ...profile, upwork: e.target.value })} placeholder="https://www.upwork.com/freelancers/…" /></label>
      <label className="font-medium">Foto profil<Input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} /></label>
      {preview && <img src={preview} alt="Foto profil" className="h-24 w-24 rounded-full object-cover" />}
      <div className="sm:col-span-2"><Button disabled={saving}>{saving ? "Menyimpan…" : "Simpan identitas"}</Button></div>
    </form>
    {toast && <Toast message={toast.message} type={toast.type} />}
  </section>;
}
