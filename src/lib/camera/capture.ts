import { JPEG_QUALITY, MAX_IMAGE_EDGE } from "@/lib/constants";

import { formatFilmDate } from "./date";
import { getFilmFilter, type FilmFilterId } from "./filters";

const TARGET_ASPECT_RATIO = 3 / 4;

export type CapturedPhoto = {
  blob: Blob;
  width: number;
  height: number;
  createdAt: Date;
};

export async function captureVideoFrame(
  video: HTMLVideoElement,
  filterId: FilmFilterId,
  now = new Date(),
): Promise<CapturedPhoto> {
  if (
    video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    throw new Error("Kamera belum siap. Tunggu sebentar lalu coba lagi.");
  }

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const sourceAspectRatio = sourceWidth / sourceHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let cropX = 0;
  let cropY = 0;

  if (sourceAspectRatio > TARGET_ASPECT_RATIO) {
    cropWidth = sourceHeight * TARGET_ASPECT_RATIO;
    cropX = (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / TARGET_ASPECT_RATIO;
    cropY = (sourceHeight - cropHeight) / 2;
  }

  const scale = Math.min(
    1,
    MAX_IMAGE_EDGE / Math.max(cropWidth, cropHeight),
  );
  const width = Math.max(1, Math.round(cropWidth * scale));
  const height = Math.max(1, Math.round(cropHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Perangkat ini belum bisa memproses foto.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    video,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );

  const preset = getFilmFilter(filterId);
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const {
    exposure,
    contrast,
    saturation,
    warmth,
    green,
    lift,
    grain,
    monochrome,
  } = preset.adjustments;

  for (let index = 0; index < pixels.length; index += 4) {
    let red = pixels[index];
    let greenChannel = pixels[index + 1];
    let blue = pixels[index + 2];

    red *= exposure;
    greenChannel *= exposure;
    blue *= exposure;

    if (monochrome) {
      const luminance = red * 0.299 + greenChannel * 0.587 + blue * 0.114;
      red = luminance;
      greenChannel = luminance;
      blue = luminance;
    } else {
      const luminance = red * 0.299 + greenChannel * 0.587 + blue * 0.114;
      red = luminance + (red - luminance) * saturation;
      greenChannel = luminance + (greenChannel - luminance) * saturation;
      blue = luminance + (blue - luminance) * saturation;
    }

    red = (red - 128) * contrast + 128 + lift + warmth;
    greenChannel =
      (greenChannel - 128) * contrast + 128 + lift + green;
    blue = (blue - 128) * contrast + 128 + lift - warmth;

    const noise = (Math.random() * 2 - 1) * grain;
    pixels[index] = red + noise;
    pixels[index + 1] = greenChannel + noise;
    pixels[index + 2] = blue + noise;
  }

  context.putImageData(imageData, 0, 0);

  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.74,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.68, "rgba(0, 0, 0, 0.05)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.3)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  const stampSize = Math.max(16, Math.round(width * 0.028));
  const stampMargin = Math.max(14, Math.round(width * 0.04));
  context.font = `600 ${stampSize}px "Courier New", monospace`;
  context.textAlign = "right";
  context.textBaseline = "bottom";
  context.fillStyle = preset.dateColor;
  context.shadowColor = "rgba(0, 0, 0, 0.65)";
  context.shadowBlur = Math.max(3, Math.round(stampSize * 0.28));
  context.fillText(
    formatFilmDate(now),
    width - stampMargin,
    height - stampMargin,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Foto gagal dibuat. Coba jepret sekali lagi."));
        }
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  return {
    blob,
    width,
    height,
    createdAt: now,
  };
}
