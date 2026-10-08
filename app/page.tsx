import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Globe2, Image, Sparkles } from "lucide-react";

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Semua karya dalam satu tempat",
    description: "Tampilkan proyek, pengalaman, pendidikan, dan sertifikat dengan susunan yang mudah dibaca.",
  },
  {
    icon: Image,
    title: "Personalisasi dengan mudah",
    description: "Tambahkan foto profil dan gambar proyek untuk membuat portofoliomu terasa lebih personal.",
  },
  {
    icon: Globe2,
    title: "Bagikan lewat username",
    description: "Portofoliomu punya alamat sederhana yang mudah dikirim ke rekruter dan klien.",
  },
];

export default function Home() {
  return (
    <main className="w-full overflow-hidden bg-[#f8fafc] text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">M</span>
          MyPorto
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200/70">Masuk</Link>
          <Link href="/register" className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">Buat portofolio</Link>
        </nav>
      </header>

      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
            <Sparkles size={15} /> Portofolio praktis, siap dibagikan
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-6xl">
            Portofolio profesional, <span className="text-indigo-600">tanpa ribet.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            MyPorto membantu kamu menyusun pengalaman dan karya menjadi satu halaman portofolio online. Isi informasi yang penting, lalu bagikan tautannya.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500">
              Mulai buat portofolio <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">
              Saya sudah punya akun
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Sederhana untuk dibuat. Mudah untuk dibagikan.</p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-indigo-200/70 via-sky-100/70 to-violet-200/70 blur-2xl" />
          <div className="relative rotate-1 rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">myporto.vercel.app/namakamu</span>
            </div>
            <div className="px-2 pb-3 pt-7 sm:px-4">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white">NK</div>
                <div><p className="text-xl font-bold text-slate-900">Nama Kamu</p><p className="mt-1 text-sm text-slate-500">Desainer & kreator digital</p></div>
              </div>
              <div className="mt-7 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Tentang saya</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Saya senang mengubah ide menjadi pengalaman digital yang bermanfaat.</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="font-semibold text-slate-900">Proyek pilihan</p>
                <span className="text-xs text-slate-400">Lihat semua</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-200 p-3"><div className="h-20 rounded-xl bg-white/60" /><p className="mt-3 text-sm font-semibold text-slate-800">Aplikasi Ruang</p><p className="mt-1 text-xs text-slate-500">Product design</p></div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-rose-200 p-3"><div className="h-20 rounded-xl bg-white/60" /><p className="mt-3 text-sm font-semibold text-slate-800">Studio Kecil</p><p className="mt-1 text-xs text-slate-500">Web development</p></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:-left-8">
            <p className="text-xs text-slate-500">Alamat portofolio</p><p className="mt-0.5 text-sm font-semibold text-slate-800">myporto.vercel.app/namakamu</p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Fokus pada hal penting</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Semua yang kamu perlukan, tanpa proses yang rumit.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={21} /></span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-7 rounded-[2rem] bg-slate-950 px-7 py-10 text-white sm:px-12 sm:py-12 md:flex-row md:items-center">
          <div><p className="text-sm font-medium text-indigo-300">Siap menunjukkan karyamu?</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Mulai dari satu halaman sederhana.</h2><p className="mt-3 max-w-xl text-slate-300">Buat akun, lengkapi profil, dan bagikan portofoliomu dengan username pilihanmu.</p></div>
          <Link href="/register" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-indigo-50">Buat akun gratis <ArrowRight size={18} /></Link>
        </div>
        <footer className="flex flex-col items-center justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row"><Link href="/" className="font-semibold text-slate-700">MyPorto</Link><p>Portofolio sederhana untuk perjalanan profesionalmu.</p><p>MyPorto. &copy; {new Date().getFullYear()}</p></footer>
      </section>
    </main>
  );
}
