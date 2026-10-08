"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) { setError(result.message || "Pendaftaran gagal."); return; }
    router.push(`/login?registered=${encodeURIComponent(String(form.get("username")))}`);
  }

  return <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
    <Link href="/" className="mb-3 self-start text-sm font-medium text-gray-600 transition hover:text-black dark:text-gray-300 dark:hover:text-white">← Kembali ke beranda</Link>
    <h1 className="text-3xl font-bold dark:text-white">Buat akun MyPorto</h1>
    <p className="mt-2 text-gray-600 dark:text-gray-300">Buat portfolio pribadi dengan alamat username kamu.</p>
    <form onSubmit={submit} className="mt-8 space-y-4">
      {[{ name: "name", label: "Nama lengkap", type: "text" }, { name: "username", label: "Username (alamat portfolio)", type: "text" }, { name: "email", label: "Email", type: "email" }, { name: "password", label: "Password (min. 8 karakter)", type: "password" }].map(field => <label key={field.name} className="block text-sm font-medium dark:text-white">{field.label}<input required minLength={field.name === "password" ? 8 : undefined} maxLength={field.name === "username" ? 30 : undefined} name={field.name} type={field.type} className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900" /></label>)}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Membuat akun…" : "Daftar"}</button>
    </form>
    <p className="mt-5 text-sm dark:text-white">Sudah punya akun? <Link className="underline" href="/login">Masuk</Link></p>
  </main>;
}
