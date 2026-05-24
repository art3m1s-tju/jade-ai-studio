import { EXHIBITS } from '../data/jadeCatalog'

export default function Header() {
  const stats = [
    ['Reference', '图生图参考生成'],
    ['Gallery', `${EXHIBITS.length} 件时间线展品`],
    ['Analysis', '多模态玉器解读'],
  ]

  return (
    <header className="relative flex w-full flex-col gap-6 border-b border-jade-border/35 py-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="mb-3 font-serif text-[0.66rem] uppercase tracking-[0.32em] text-jade-gold/75">
          Jade Pattern · AI Digital Studio
        </p>
        <h1 className="font-serif text-[1.9rem] font-light leading-tight text-jade-text-bright sm:text-[2.45rem] lg:text-[3rem]">
          AI 玉器纹样工作室
        </h1>
        <p className="mt-4 max-w-2xl text-[0.92rem] leading-7 text-jade-text-dim">
          以馆藏参考图约束生成，以器型、纹饰、玉质三层结构重塑千年玉文化的温润质感。
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[440px]">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-jade-border/45 bg-white/[0.035] px-3 py-3">
            <p className="text-[0.56rem] uppercase tracking-[0.18em] text-jade-gold/60">{label}</p>
            <p className="mt-1 text-[0.76rem] leading-5 text-jade-text-bright/78">{value}</p>
          </div>
        ))}
      </div>
    </header>
  )
}
