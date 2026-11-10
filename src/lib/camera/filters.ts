export type FilmFilterId = "senja" | "lembut" | "monokrom";

export type FilmFilterPreset = {
  id: FilmFilterId;
  label: string;
  description: string;
  cssFilter: string;
  swatch: string;
  dateColor: string;
  adjustments: {
    exposure: number;
    contrast: number;
    saturation: number;
    warmth: number;
    green: number;
    lift: number;
    grain: number;
    monochrome: boolean;
  };
};

export const FILM_FILTERS: readonly FilmFilterPreset[] = [
  {
    id: "senja",
    label: "Senja",
    description: "Hangat, sedikit pudar, dan kaya warna.",
    cssFilter:
      "brightness(1.02) contrast(1.07) saturate(1.12) sepia(0.16) hue-rotate(-8deg)",
    swatch: "linear-gradient(135deg, #e4b867 0%, #a84f35 100%)",
    dateColor: "#ffc46b",
    adjustments: {
      exposure: 1.02,
      contrast: 1.07,
      saturation: 1.12,
      warmth: 16,
      green: 3,
      lift: 0,
      grain: 9,
      monochrome: false,
    },
  },
  {
    id: "lembut",
    label: "Lembut",
    description: "Warna susu dengan kontras yang tenang.",
    cssFilter:
      "brightness(1.06) contrast(0.9) saturate(0.82) sepia(0.12)",
    swatch: "linear-gradient(135deg, #efe0bf 0%, #b6926f 100%)",
    dateColor: "#ffd08b",
    adjustments: {
      exposure: 1.06,
      contrast: 0.9,
      saturation: 0.78,
      warmth: 10,
      green: 4,
      lift: 16,
      grain: 11,
      monochrome: false,
    },
  },
  {
    id: "monokrom",
    label: "Monokrom",
    description: "Hitam putih dengan grain yang tegas.",
    cssFilter: "grayscale(1) contrast(1.12) brightness(1.03)",
    swatch: "linear-gradient(135deg, #d6d0c4 0%, #4a443d 100%)",
    dateColor: "#ffc46b",
    adjustments: {
      exposure: 1.03,
      contrast: 1.1,
      saturation: 0,
      warmth: 0,
      green: 0,
      lift: 4,
      grain: 13,
      monochrome: true,
    },
  },
];

export function getFilmFilter(id: FilmFilterId): FilmFilterPreset {
  return FILM_FILTERS.find((filter) => filter.id === id) ?? FILM_FILTERS[0];
}
