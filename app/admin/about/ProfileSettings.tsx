"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";

type Profile = {
  username: string;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  instagram: string;
  twitter: string;
  linkedin: string;
  github: string;
  upwork: string;
};

const emptyProfile: Profile = {
  username: "",
  name: "",
  email: "",
  phone: "",
  photo: null,
  instagram: "",
  twitter: "",
  linkedin: "",
  github: "",
  upwork: "",
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(emptyProfile);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast, showToast } = useToast();
  const preview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : profile.photo),
    [photo, profile.photo]
  );

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (result.data) setProfile({ ...emptyProfile, ...result.data });
      } catch {
        showToast("Gagal memuat data identitas profil.", "error");
      }
    }

    loadProfile();
  }, [showToast]);

  useEffect(
    () => () => {
      if (photo && preview) URL.revokeObjectURL(preview);
    },
    [photo, preview]
  );

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const form = new FormData(event.currentTarget);
      if (photo) form.set("photo", photo);

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: form,
      });
      if (!response.ok) throw new Error();

      const result = await response.json();
      setProfile({ ...emptyProfile, ...result.data });
      setPhoto(null);
      showToast("Identitas profil berhasil disimpan.", "success");
    } catch {
      showToast("Gagal menyimpan identitas profil.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-10 rounded-xl border bg-white p-6 mt-10 shadow-sm dark:bg-gray-700">
      <h2 className="text-2xl font-bold dark:text-white">Identitas Portofolio</h2>
      <p className="mb-5 mt-1 text-sm text-gray-500 dark:text-gray-200">
        Username publik: /{profile.username}
      </p>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 dark:text-white">
        <label className="font-medium">
          Nama lengkap
          <Input
            name="name"
            required
            className="dark:text-white"
            value={profile.name}
            onChange={(event) =>
              setProfile({ ...profile, name: event.target.value })
            }
          />
        </label>
        <label className="font-medium">
          Email publik
          <Input
            name="email"
            type="email"
            required
            className="dark:text-white"
            value={profile.email}
            onChange={(event) =>
              setProfile({ ...profile, email: event.target.value })
            }
          />
        </label>
        <label className="font-medium">
          Nomor WhatsApp
          <Input
            name="phone"
            value={profile.phone}
            className="dark:text-white"
            onChange={(event) =>
              setProfile({ ...profile, phone: event.target.value })
            }
            placeholder="62812…"
          />
        </label>
        <label className="font-medium">
          Instagram
          <Input
            name="instagram"
            value={profile.instagram}
            className="dark:text-white"
            onChange={(event) =>
              setProfile({ ...profile, instagram: event.target.value })
            }
            placeholder="nama pengguna"
          />
        </label>
        <label className="font-medium">
          X / Twitter
          <Input
            name="twitter"
            value={profile.twitter}
            className="dark:text-white"
            onChange={(event) =>
              setProfile({ ...profile, twitter: event.target.value })
            }
            placeholder="nama pengguna"
          />
        </label>
        <label className="font-medium">
          URL LinkedIn
          <Input
            name="linkedin"
            type="url"
            value={profile.linkedin}
            className="dark:text-white"
            onChange={(event) =>
              setProfile({ ...profile, linkedin: event.target.value })
            }
            placeholder="https://linkedin.com/in/nama"
          />
        </label>
        <label className="font-medium">
          URL GitHub
          <Input
            name="github"
            type="url"
            value={profile.github}
            className="dark:text-white"
            onChange={(event) =>
              setProfile({ ...profile, github: event.target.value })
            }
            placeholder="https://github.com/nama"
          />
        </label>
        <label className="font-medium">
          URL Upwork
          <Input
            name="upwork"
            type="url"
            value={profile.upwork}
            className="dark:text-white"
            onChange={(event) =>
              setProfile({ ...profile, upwork: event.target.value })
            }
            placeholder="https://www.upwork.com/freelancers/…"
          />
        </label>
        <label className="font-medium">
          Foto profil
          <Input
            type="file"
            accept="image/*"
            className="dark:text-white"
            onChange={(event) => setPhoto(event.target.files?.[0] || null)}
          />
        </label>
        {preview && (
          <Image
            src={preview}
            alt="Foto profil"
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
        <div className="sm:col-span-2">
          <Button disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan identitas"}
          </Button>
        </div>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </section>
  );
}
