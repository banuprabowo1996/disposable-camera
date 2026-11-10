import type { Metadata } from "next";
import { Suspense } from "react";

import { CameraExperience } from "@/components/camera/camera-experience";

type CameraPageProps = {
  params: Promise<{ rollCode: string }>;
};

async function getRollCode(params: CameraPageProps["params"]) {
  const { rollCode } = await params;
  const normalized = rollCode.trim().slice(0, 32);

  return normalized || "demo";
}

export const metadata: Metadata = {
  title: "Kamera Tamu — Disposable Camera",
  description:
    "Ambil sepuluh momen dengan filter film retro, lalu kirimkan ke galeri rahasia pengantin.",
};

function CameraPageFallback() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#161310] px-6 text-center text-paper">
      <div className="flex flex-col items-center">
        <span className="size-9 animate-spin rounded-full border-2 border-paper/15 border-t-mustard" />
        <p className="mt-6 font-mono text-[0.64rem] font-bold uppercase tracking-[0.24em] text-mustard">
          Menyiapkan roll
        </p>
        <p className="mt-2 text-sm text-paper/45">
          Kamera akan terbuka sebentar lagi.
        </p>
      </div>
    </main>
  );
}

async function CameraPageContent({ params }: CameraPageProps) {
  const rollCode = await getRollCode(params);

  return <CameraExperience rollCode={rollCode} />;
}

export default function CameraPage({ params }: CameraPageProps) {
  return (
    <Suspense fallback={<CameraPageFallback />}>
      <CameraPageContent params={params} />
    </Suspense>
  );
}
