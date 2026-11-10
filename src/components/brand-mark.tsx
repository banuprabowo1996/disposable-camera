export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full border border-ink/25 bg-mustard font-serif text-sm font-bold tracking-tight text-ink shadow-[3px_3px_0_0_var(--color-ink)]"
      >
        35
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-semibold tracking-tight text-ink">
          Disposable Camera
        </span>
        <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-ink-soft">
          Edisi Pernikahan
        </span>
      </span>
    </div>
  );
}
