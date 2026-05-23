export default function Header() {
  return (
    <header className="relative flex w-full items-center justify-between gap-6 border-b border-jade-border/35 py-5">
      <div className="min-w-0">
        <p className="mb-3 font-serif text-[0.66rem] uppercase tracking-[0.32em] text-jade-gold/75">
          Jade Pattern · AI Digital Studio
        </p>
        <h1 className="font-serif text-[1.9rem] font-light leading-tight text-jade-text-bright sm:text-[2.45rem] lg:text-[3rem]">
          AI 玉器纹样工作室
        </h1>
        <p className="mt-4 max-w-2xl text-[0.92rem] leading-7 text-jade-text-dim">
          以 AI 为光，以玉石为骨，在数字维度中重塑千年文化的温润质感。
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-3 lg:flex">
        <div className="h-px w-16 bg-jade-gold/45" />
        <div className="h-2 w-2 rotate-45 border border-jade-gold/70" />
      </div>
    </header>
  )
}
