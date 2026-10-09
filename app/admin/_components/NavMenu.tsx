"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const items = [
  ["Projects", "/admin/projects"],
  ["About & profile", "/admin/about"],
  ["Experience", "/admin/work-experiences"],
  ["Certificates", "/admin/certificates"],
  ["Education", "/admin/educations"],
];

export default function NavMenu() {
  const [username, setUsername] = useState("");
  useEffect(() => { fetch("/api/auth/session").then(r => r.json()).then(s => setUsername(s?.user?.username || "")); }, []);
  return <nav className="w-full py-3 dark:text-white">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Link href="/admin/projects" className="font-bold text-4xl">MyPorto Dashboard</Link>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {username && <Link href={`/${username}`} target="_blank" className="underline">Lihat portofolio</Link>}
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded bg-black px-4 py-2 text-white">Keluar</button>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">{items.map(([label, href]) => <Link key={href} href={href} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{label}</Link>)}</div>
  </nav>;
}
