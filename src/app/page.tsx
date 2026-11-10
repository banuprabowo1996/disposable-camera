import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const steps = [
  {
    number: "01",
    title: "Pindai QR",
    description:
      "Setiap meja punya roll sendiri. Tidak perlu unduh aplikasi atau membuat akun.",
  },
  {
    number: "02",
    title: "Potret momen",
    description:
      "Sepuluh jepretan per perangkat, lengkap dengan warna hangat dan grain ala film.",
  },
  {
    number: "03",
    title: "Tunggu dicuci",
    description:
      "Foto masuk ke galeri rahasia pengantin dan dibuka setelah acara selesai.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden="true"
        className="film-grain pointer-events-none absolute inset-0 opacity-80"
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-9">
        <header className="flex items-center justify-between gap-6">
          <BrandMark />
          <span className="hidden rounded-full border border-ink/20 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-ink-soft sm:inline-block">
            Sejak 2026
          </span>
        </header>

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-rust/25 bg-rust/10 px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.24em] text-rust">
              <span className="size-1.5 rounded-full bg-rust" />
              Kamera sekali pakai untuk pernikahan
            </p>

            <h1 className="font-serif text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
              Satu roll,
              <br />
              sepuluh cerita
              <br />
              yang jujur.
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
              Biarkan tamu menangkap momen dari sudut pandang mereka. Cukup pindai
              kode di meja, potret sepuluh kali, lalu serahkan sisanya pada memori
              yang sedang dicuci.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/c/demo"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-paper transition hover:bg-[#43372b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rust"
              >
                Coba kamera demo
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-3.5"
                >
                  <path
                    d="M5 12h14m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="text-sm text-ink-soft">
                Tanpa instalasi. Tanpa pendaftaran.
              </span>
            </div>
          </div>

          <figure className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="absolute -inset-3 -z-10 rotate-3 rounded-[2.35rem] border border-ink/15 bg-paper-deep" />
            <div className="rotate-1 rounded-[2rem] border border-ink/25 bg-[#c8ad84] p-3 shadow-[10px_12px_0_0_rgb(44_35_26_/_0.14)]">
              <div className="rounded-[1.55rem] bg-ink p-4">
                <div className="flex items-center justify-between text-paper">
                  <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.22em]">
                    Roll 01
                  </span>
                  <span className="rounded-full bg-rust px-2.5 py-1 font-mono text-[0.58rem] font-bold uppercase tracking-[0.18em] text-paper">
                    10 jepretan
                  </span>
                </div>

                <div className="film-grain relative mt-4 aspect-[4/5] overflow-hidden rounded-xl border-4 border-[#574838] bg-[linear-gradient(155deg,#a9ad8b_0%,#d6b77d_42%,#98543c_100%)]">
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 font-mono text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white/75">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#ff725e]" />
                      Siap
                    </span>
                    <span>35 mm</span>
                  </div>

                  <div className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center">
                    <span className="absolute left-0 top-0 size-4 border-l border-t border-white/70" />
                    <span className="absolute right-0 top-0 size-4 border-r border-t border-white/70" />
                    <span className="absolute bottom-0 left-0 size-4 border-b border-l border-white/70" />
                    <span className="absolute bottom-0 right-0 size-4 border-b border-r border-white/70" />
                    <span className="size-1 rounded-full bg-white/80" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/45 to-transparent p-3">
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/80">
                      400 ISO
                    </span>
                    <span className="font-mono text-[0.66rem] tracking-[0.14em] text-[#ffd28a]">
                      06 11 &apos;26
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-mustard" />
                    <span className="size-2 rounded-full bg-paper/35" />
                    <span className="size-2 rounded-full bg-paper/35" />
                  </div>
                  <span
                    aria-hidden="true"
                    className="grid size-12 place-items-center rounded-full border-4 border-[#a58b66] bg-[#dfc8a5] shadow-inner"
                  >
                    <span className="size-6 rounded-full border border-ink/30 bg-paper-deep" />
                  </span>
                  <span className="w-9 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-paper/55">
                    Sisa
                  </span>
                </div>
              </div>
            </div>
            <figcaption className="mt-5 text-center font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">
              Kenangan dikembangkan dengan sabar
            </figcaption>
          </figure>
        </section>

        <section aria-labelledby="cara-kerja" className="pb-14">
          <div className="mb-7 flex items-end justify-between gap-6 border-t border-ink/15 pt-7">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-rust">
                Cara kerjanya
              </p>
              <h2
                id="cara-kerja"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink"
              >
                Sesederhana kamera sekali pakai.
              </h2>
            </div>
            <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft sm:block">
              3 langkah
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-ink/15 bg-white/35 p-5 backdrop-blur-[2px]"
              >
                <span className="font-mono text-xs font-bold tracking-[0.18em] text-rust">
                  {step.number}
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 pb-10 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-3xl border border-ink/20 bg-ink p-6 text-paper sm:p-8">
            <div
              aria-hidden="true"
              className="absolute -right-9 -top-9 size-28 rounded-full border border-paper/15"
            />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-mustard">
              Untuk tamu
            </p>
            <h2 className="mt-4 max-w-sm font-serif text-3xl font-semibold leading-tight">
              Pindai, potret, lalu nikmati kejutannya.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-paper/65">
              Akses kamera langsung dari browser. Kuota, filter, dan status unggah
              tampil jelas tanpa membuat akun.
            </p>
            <span className="mt-7 inline-block rounded-full border border-paper/20 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/65">
              Segera dibuka lewat QR
            </span>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-ink/20 bg-rust p-6 text-paper sm:p-8">
            <div
              aria-hidden="true"
              className="absolute -bottom-12 -right-8 size-36 rounded-full bg-mustard/20"
            />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-mustard">
              Untuk pengantin
            </p>
            <h2 className="mt-4 max-w-sm font-serif text-3xl font-semibold leading-tight">
              Galeri rahasia, kurasi milik kalian.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-paper/70">
              Kelola roll per meja, buat kode isi ulang, dan buka galeri hanya saat
              kalian sudah siap melihat semuanya.
            </p>
            <span className="mt-7 inline-block rounded-full border border-paper/25 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/70">
              Panel pengantin segera hadir
            </span>
          </article>
        </section>

        <footer className="mt-auto flex flex-col gap-2 border-t border-ink/15 py-5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>Disposable Camera</span>
          <span>Dibuat untuk momen yang tak ingin cepat hilang</span>
        </footer>
      </div>
    </main>
  );
}
