"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { captureVideoFrame, type CapturedPhoto } from "@/lib/camera/capture";
import {
  FILM_FILTERS,
  getFilmFilter,
  type FilmFilterId,
} from "@/lib/camera/filters";
import { DEFAULT_SHOTS_LIMIT } from "@/lib/constants";

type CameraState =
  | { status: "starting" }
  | { status: "ready" }
  | {
      status: "error";
      title: string;
      message: string;
      canRetry: boolean;
    };

type LatestCapture = CapturedPhoto & {
  objectUrl: string;
  filterLabel: string;
};

type CameraExperienceProps = {
  rollCode: string;
};

const TOTAL_SHOTS = DEFAULT_SHOTS_LIMIT;

function describeCameraError(error: unknown): CameraState {
  const errorName =
    error instanceof DOMException || error instanceof Error
      ? error.name
      : "UnknownError";

  if (errorName === "NotAllowedError" || errorName === "SecurityError") {
    return {
      status: "error",
      title: "Izin kamera belum diberikan",
      message:
        "Ketuk ikon kunci atau pengaturan situs di bilah alamat, izinkan kamera, lalu muat ulang halaman. Di iPhone, periksa juga Pengaturan > Safari > Kamera.",
      canRetry: true,
    };
  }

  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return {
      status: "error",
      title: "Kamera tidak ditemukan",
      message:
        "Perangkat ini tidak mendeteksi kamera yang bisa dipakai. Coba buka dengan ponsel lain atau hubungi pengantin.",
      canRetry: true,
    };
  }

  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    return {
      status: "error",
      title: "Kamera sedang tidak bisa dipakai",
      message:
        "Kamera mungkin sedang digunakan aplikasi lain. Tutup aplikasi kamera atau video call, lalu coba lagi.",
      canRetry: true,
    };
  }

  if (errorName === "OverconstrainedError") {
    return {
      status: "error",
      title: "Kamera belakang tidak tersedia",
      message:
        "Perangkat tidak menemukan kamera belakang yang cocok. Coba lagi atau gunakan ponsel lain.",
      canRetry: true,
    };
  }

  return {
    status: "error",
    title: "Kamera gagal dibuka",
    message:
      "Terjadi kendala saat menyiapkan kamera. Muat ulang halaman atau coba beberapa saat lagi.",
    canRetry: true,
  };
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function CameraExperience({ rollCode }: CameraExperienceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);
  const captureLockRef = useRef(false);
  const lastCaptureRef = useRef<LatestCapture | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>({
    status: "starting",
  });
  const [activeFilterId, setActiveFilterId] =
    useState<FilmFilterId>("senja");
  const [shotsRemaining, setShotsRemaining] = useState(TOTAL_SHOTS);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [lastCapture, setLastCapture] = useState<LatestCapture | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const activeFilter = getFilmFilter(activeFilterId);
  const isReady = cameraState.status === "ready";
  const usedShots = TOTAL_SHOTS - shotsRemaining;
  const isExhausted = shotsRemaining === 0;

  const stopStream = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const requestId = ++requestIdRef.current;
    stopStream();
    setCameraState({ status: "starting" });
    setNotice(null);

    if (!window.isSecureContext) {
      setCameraState({
        status: "error",
        title: "Kamera membutuhkan HTTPS",
        message:
          "Akses kamera hanya berjalan di alamat HTTPS atau localhost. Buka tautan dari Vercel, bukan alamat IP lokal dengan HTTP.",
        canRetry: false,
      });
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState({
        status: "error",
        title: "Browser belum mendukung kamera",
        message:
          "Gunakan Safari atau Chrome versi terbaru, lalu buka kembali halaman ini.",
        canRetry: false,
      });
      return;
    }

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
        });
      } catch (error) {
        const name = error instanceof Error ? error.name : "";

        if (name === "OverconstrainedError" || name === "NotFoundError") {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        } else {
          throw error;
        }
      }

      if (requestId !== requestIdRef.current) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        return;
      }

      const video = videoRef.current;

      if (!video) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      if (requestId !== requestIdRef.current) {
        stopStream();
        return;
      }

      setCameraState({ status: "ready" });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      stopStream();
      setCameraState(describeCameraError(error));
    }
  }, [stopStream]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startCamera();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      requestIdRef.current += 1;
      stopStream();
    };
  }, [startCamera, stopStream]);

  useEffect(() => {
    if (!isExhausted) {
      return;
    }

    requestIdRef.current += 1;
    stopStream();
  }, [isExhausted, stopStream]);

  useEffect(() => {
    return () => {
      const latest = lastCaptureRef.current;

      if (latest) {
        URL.revokeObjectURL(latest.objectUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 5000);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen]);

  const handleShutter = useCallback(async () => {
    const video = videoRef.current;

    if (
      !video ||
      !isReady ||
      isCapturing ||
      isExhausted ||
      captureLockRef.current
    ) {
      return;
    }

    captureLockRef.current = true;
    setIsCapturing(true);
    setFlashVisible(true);
    setNotice(null);

    try {
      await wait(80);
      const captured = await captureVideoFrame(video, activeFilterId);
      const objectUrl = URL.createObjectURL(captured.blob);
      const previous = lastCaptureRef.current;

      if (previous) {
        URL.revokeObjectURL(previous.objectUrl);
      }

      const nextCapture: LatestCapture = {
        ...captured,
        objectUrl,
        filterLabel: activeFilter.label,
      };

      lastCaptureRef.current = nextCapture;
      setLastCapture(nextCapture);
      setShotsRemaining((remaining) => Math.max(0, remaining - 1));
      setPreviewOpen(true);

      if (navigator.vibrate) {
        navigator.vibrate(24);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Foto gagal diproses. Coba jepret sekali lagi.",
      );
    } finally {
      setFlashVisible(false);
      setIsCapturing(false);
      captureLockRef.current = false;
    }
  }, [
    activeFilter.label,
    activeFilterId,
    isCapturing,
    isExhausted,
    isReady,
  ]);

  const closePreview = useCallback(() => setPreviewOpen(false), []);

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[#161310] text-paper"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_50%_-10%,rgba(215,165,63,0.16),transparent_28rem)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-2.25rem)] w-full max-w-lg flex-col px-4">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Kembali ke beranda"
            className="grid size-10 place-items-center rounded-full border border-paper/15 bg-paper/5 text-paper/70 transition hover:bg-paper/10 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <div className="text-center">
            <p className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.24em] text-mustard">
              Roll {rollCode.toUpperCase()}
            </p>
            <p className="mt-1 text-[0.66rem] uppercase tracking-[0.18em] text-paper/40">
              Kamera tamu
            </p>
          </div>

          <div className="rounded-full border border-paper/15 bg-paper/5 px-3 py-2 text-right">
            <p className="font-mono text-sm font-bold leading-none text-paper">
              {shotsRemaining}
              <span className="text-paper/35">/{TOTAL_SHOTS}</span>
            </p>
            <p className="mt-1 text-[0.52rem] uppercase tracking-[0.16em] text-paper/40">
              sisa
            </p>
          </div>
        </header>

        {isExhausted ? (
          <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="grid size-20 place-items-center rounded-full border border-mustard/30 bg-mustard/10">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-9 text-mustard"
              >
                <path
                  d="M4 8.5h3l1.4-2h7.2L17 8.5h3v10H4v-10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="13.3"
                  r="3.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <p className="mt-7 font-mono text-[0.64rem] font-bold uppercase tracking-[0.26em] text-mustard">
              Roll selesai
            </p>
            <h1 className="mt-3 max-w-sm font-serif text-4xl font-semibold leading-tight tracking-tight text-paper">
              Film kamu sudah habis
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-paper/55">
              Terima kasih sudah ikut memotret cerita kami. Pengantin akan membuka
              galeri setelah acara selesai.
            </p>

            <div className="mt-7 flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 font-mono text-xs text-paper/55">
              <span className="size-1.5 rounded-full bg-mustard" />
              {TOTAL_SHOTS} dari {TOTAL_SHOTS} jepretan terpakai
            </div>

            <Link
              href="/"
              className="mt-8 rounded-full bg-paper px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard"
            >
              Kembali ke beranda
            </Link>
          </section>
        ) : (
          <>
            <div className="mt-5 flex flex-1 items-center justify-center">
              <div className="relative aspect-[3/4] w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-paper/15 bg-[#0f0d0b] shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_40%_25%,#4a3d2e_0%,#17130f_65%)]"
                />

                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300"
                  style={{ filter: activeFilter.cssFilter }}
                  autoPlay
                  muted
                  playsInline
                  disablePictureInPicture
                  aria-label="Pratinjau kamera"
                />

                <div
                  aria-hidden="true"
                  className="film-grain pointer-events-none absolute inset-0 opacity-55"
                />

                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-gradient-to-b from-black/55 to-transparent px-4 pb-10 pt-4">
                  <span className="flex items-center gap-1.5 font-mono text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white/75">
                    <span
                      className={`size-1.5 rounded-full ${
                        isReady ? "bg-[#ff7b62]" : "bg-white/35"
                      }`}
                    />
                    {isReady ? "Aktif" : "Tunggu"}
                  </span>
                  <span className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white/55">
                    35 mm
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-5 z-10"
                >
                  <span className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
                  <span className="absolute inset-y-0 right-1/3 w-px bg-white/10" />
                  <span className="absolute inset-x-0 top-1/3 h-px bg-white/10" />
                  <span className="absolute inset-x-0 bottom-1/3 h-px bg-white/10" />
                  <span className="absolute left-0 top-0 size-5 border-l border-t border-white/55" />
                  <span className="absolute right-0 top-0 size-5 border-r border-t border-white/55" />
                  <span className="absolute bottom-0 left-0 size-5 border-b border-l border-white/55" />
                  <span className="absolute bottom-0 right-0 size-5 border-b border-r border-white/55" />
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-12">
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-white/55">
                    ISO 400
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#ffd28a]">
                    Sisa {shotsRemaining}
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 z-30 bg-white transition-opacity duration-150 ${
                    flashVisible ? "opacity-90" : "opacity-0"
                  }`}
                />

                {cameraState.status !== "ready" ? (
                  <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#17130f]/94 p-6 text-center backdrop-blur-sm">
                    {cameraState.status === "starting" ? (
                      <div className="max-w-xs">
                        <span className="mx-auto block size-9 animate-spin rounded-full border-2 border-paper/15 border-t-mustard" />
                        <h2 className="mt-6 font-serif text-2xl font-semibold text-paper">
                          Menyiapkan kamera
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-paper/50">
                          Izinkan akses kamera jika browser meminta.
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-xs" role="alert">
                        <div className="mx-auto grid size-14 place-items-center rounded-full border border-rust/35 bg-rust/15">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="size-7 text-[#ff9c86]"
                          >
                            <path
                              d="M12 8v5m0 3h.01M10.3 4.3 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <h2 className="mt-5 font-serif text-2xl font-semibold leading-tight text-paper">
                          {cameraState.title}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-paper/55">
                          {cameraState.message}
                        </p>
                        {cameraState.canRetry ? (
                          <button
                            type="button"
                            onClick={() => void startCamera()}
                            className="mt-6 rounded-full bg-paper px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard"
                          >
                            Coba lagi
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <section aria-labelledby="filter-title" className="mt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="filter-title"
                    className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-paper/45"
                  >
                    Pilih film
                  </h2>
                  <p className="mt-1 text-xs text-paper/65">
                    {activeFilter.description}
                  </p>
                </div>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-mustard">
                  {activeFilter.label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {FILM_FILTERS.map((filter) => {
                  const selected = filter.id === activeFilterId;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilterId(filter.id)}
                      aria-pressed={selected}
                      className={`rounded-xl border p-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard ${
                        selected
                          ? "border-mustard/70 bg-paper/10"
                          : "border-paper/10 bg-paper/[0.035] hover:border-paper/25"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="block h-7 rounded-md"
                        style={{ backgroundImage: filter.swatch }}
                      />
                      <span
                        className={`mt-2 block text-[0.64rem] font-semibold uppercase tracking-[0.12em] ${
                          selected ? "text-mustard" : "text-paper/55"
                        }`}
                      >
                        {filter.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mt-5 grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3">
              <button
                type="button"
                onClick={() => lastCapture && setPreviewOpen(true)}
                disabled={!lastCapture}
                aria-label="Lihat jepretan terakhir"
                className="relative size-[4.5rem] overflow-hidden rounded-xl border border-paper/15 bg-paper/5 disabled:cursor-default"
              >
                {lastCapture ? (
                  <span
                    role="img"
                    aria-label={`Jepretan terakhir dengan filter ${lastCapture.filterLabel}`}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${lastCapture.objectUrl})`,
                    }}
                  />
                ) : (
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-paper/30">
                    Belum
                    <br />
                    ada
                  </span>
                )}
                {lastCapture ? (
                  <span className="absolute bottom-1 right-1 rounded-full bg-ink/80 px-1.5 py-0.5 font-mono text-[0.5rem] font-bold text-paper">
                    {usedShots}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => void handleShutter()}
                disabled={!isReady || isCapturing || isExhausted}
                aria-label="Ambil foto"
                className="group mx-auto grid size-[5.6rem] place-items-center rounded-full border-[5px] border-paper/25 bg-paper transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span
                  className={`grid size-[4.15rem] place-items-center rounded-full bg-rust transition group-active:scale-90 ${
                    isCapturing ? "scale-90" : ""
                  }`}
                >
                  {isCapturing ? (
                    <span className="size-5 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                  ) : (
                    <span className="size-8 rounded-full border border-paper/50" />
                  )}
                </span>
              </button>

              <div className="text-right">
                <p className="font-mono text-xl font-semibold leading-none text-paper">
                  {shotsRemaining}
                  <span className="text-paper/30">/{TOTAL_SHOTS}</span>
                </p>
                <p className="mt-1 text-[0.56rem] uppercase tracking-[0.16em] text-paper/40">
                  sisa jepretan
                </p>
              </div>
            </div>

            <p className="mt-4 text-center text-[0.62rem] leading-5 text-paper/30">
              Foto diproses di perangkat ini. Jangan tutup halaman setelah memotret.
            </p>
          </>
        )}
      </div>

      {notice ? (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl border border-rust/35 bg-[#2a1a16] px-4 py-3 text-center text-sm leading-6 text-[#ffd7cd] shadow-2xl"
        >
          {notice}
        </div>
      ) : null}

      {previewOpen && lastCapture ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="capture-preview-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="w-full max-w-sm rounded-[1.8rem] border border-ink/10 bg-paper p-3 text-ink shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-ink">
              <div
                role="img"
                aria-label={`Pratinjau hasil jepretan dengan filter ${lastCapture.filterLabel}`}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${lastCapture.objectUrl})` }}
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/75 backdrop-blur">
                {lastCapture.filterLabel}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 px-2 pb-1 pt-4">
              <div>
                <p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.2em] text-rust">
                  Jepretan {usedShots} dari {TOTAL_SHOTS}
                </p>
                <h2
                  id="capture-preview-title"
                  className="mt-1 font-serif text-2xl font-semibold tracking-tight"
                >
                  Hasil film
                </h2>
                <p className="mt-2 text-xs leading-5 text-ink-soft">
                  {lastCapture.width} × {lastCapture.height} px · JPEG
                </p>
              </div>
              <span className="rounded-full border border-ink/15 px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-ink-soft">
                {isExhausted ? "Habis" : `Sisa ${shotsRemaining}`}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closePreview}
                className="rounded-full border border-ink/20 px-4 py-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  closePreview();

                  if (isExhausted) {
                    return;
                  }

                  window.setTimeout(() => {
                    void handleShutter();
                  }, 180);
                }}
                disabled={isExhausted}
                className="rounded-full bg-ink px-4 py-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-[#43372b] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
              >
                Jepret lagi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
