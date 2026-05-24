import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiExternalLink } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { EXHIBITS } from '../data/jadeCatalog'

const hideUnavailableImage = (event) => {
  event.currentTarget.dataset.failed = 'true'
  event.currentTarget.style.display = 'none'
}

export default function DigitalGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrls, setAudioUrls] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const audioRef = useRef(null)

  const exhibit = EXHIBITS[activeIndex]

  const goNext = () => { setActiveIndex((prev) => (prev + 1) % EXHIBITS.length); setIsPlaying(false) }
  const goPrev = () => { setActiveIndex((prev) => (prev - 1 + EXHIBITS.length) % EXHIBITS.length); setIsPlaying(false) }
  const selectExhibit = (idx) => {
    audioRef.current?.pause()
    setIsPlaying(false)
    setActiveIndex(idx)
  }

  const handleAudio = async () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); return }

    let url = audioUrls[exhibit.id]
    if (!url) {
      setIsGenerating(true)
      try {
        const res = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: exhibit.audioText, id: exhibit.id }),
        })
        if (res.ok) {
          const blob = await res.blob()
          url = URL.createObjectURL(blob)
          setAudioUrls(p => ({ ...p, [exhibit.id]: url }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsGenerating(false)
      }
    }
    if (url && audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => () => {
    Object.values(audioUrls).forEach((url) => URL.revokeObjectURL(url))
  }, [audioUrls])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-serif text-[0.68rem] uppercase tracking-[0.24em] text-jade-gold/70">Digital Gallery</p>
          <h2 className="font-serif text-[1.7rem] font-light text-jade-text-bright sm:text-[2.1rem]">数字展廊</h2>
        </div>
        <p className="max-w-xl text-[0.86rem] leading-7 text-jade-text-dim">
          从史前礼器到明清陈设，按时间线浏览玉器形制、纹样与文化语义的演变。
        </p>
      </div>

      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2 border-b border-jade-border/35 pb-4">
          {EXHIBITS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => selectExhibit(idx)}
              aria-current={idx === activeIndex ? 'true' : undefined}
              className={`group flex min-w-32 flex-col items-start rounded-xl border px-3 py-2 text-left transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-jade-bg
                ${idx === activeIndex
                  ? 'border-jade-gold/60 bg-jade-gold/12 text-jade-text-bright'
                  : 'border-jade-border/40 bg-white/[0.025] text-jade-text-dim hover:border-jade-gold/35 hover:text-jade-text-bright'
                }`}
            >
              <span className="text-[0.58rem] uppercase tracking-[0.16em] text-jade-gold/60">{item.era}</span>
              <span className="mt-1 max-w-28 truncate text-[0.76rem]">{item.name.replace(/\s/g, '')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <button onClick={goPrev} aria-label="上一件展品" className="absolute left-3 top-[180px] z-20 flex rounded-full border border-jade-border/45 bg-black/45 p-3 text-jade-text-dim backdrop-blur-md transition hover:border-jade-gold/45 hover:text-jade-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70 md:static md:p-4">
            <FiChevronLeft size={24} strokeWidth={1} />
          </button>

          <div className="glass-panel relative z-10 flex min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-jade-border/40 md:min-h-[560px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={exhibit.id}
                initial={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full flex-1 flex-col md:flex-row"
              >
                <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden border-b border-jade-border/30 bg-black/25 sm:min-h-[360px] md:w-1/2 md:border-b-0 md:border-r">
                  <div className="absolute inset-0 opacity-45">
                    <img
                      src={exhibit.image}
                      alt=""
                      onError={hideUnavailableImage}
                      className="h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                    />
                    <div className="absolute inset-0 bg-black/70" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="h-56 w-56 rounded-full blur-[70px] animate-breath"
                      style={{ backgroundColor: exhibit.color, opacity: 0.18 }}
                    />
                  </div>

                  <div className="relative z-10 mx-6 aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-xl border border-white/12 bg-black/35 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
                    <img
                      src={exhibit.image}
                      alt={exhibit.name}
                      onError={hideUnavailableImage}
                      className="h-full w-full object-contain p-5"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_34%,rgba(0,0,0,0.25))]" />
                  </div>
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-9 md:w-1/2 md:p-12">
                  <div className="mb-8 flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <p className="mb-2 text-[0.65rem] uppercase tracking-[0.3em] text-jade-gold/60">{exhibit.era}</p>
                      <h3 className="font-serif text-[1.9rem] font-light text-jade-text-bright sm:text-[2.2rem]">{exhibit.name}</h3>
                    </div>
                    <button
                      onClick={handleAudio}
                      disabled={isGenerating}
                      aria-label={isPlaying ? '暂停语音讲解' : '播放语音讲解'}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-jade-border/40 text-jade-gold/70 transition-all hover:border-jade-gold hover:text-jade-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70"
                    >
                      {isGenerating ? <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-jade-gold" /> : (isPlaying ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />)}
                    </button>
                  </div>

                  <p className="mb-6 text-[0.7rem] uppercase tracking-[0.2em] text-jade-text-dim">{exhibit.date}</p>
                  <div className="mb-7 grid gap-3 sm:grid-cols-3">
                    {[
                      ['材质', exhibit.material],
                      ['纹样', exhibit.motif],
                      ['看点', exhibit.highlight],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-jade-border/50 bg-black/18 p-3">
                        <p className="mb-1 text-[0.62rem] tracking-[0.18em] text-jade-gold/60">{label}</p>
                        <p className="text-[0.76rem] leading-5 text-jade-text-bright/78">{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[0.9rem] font-light leading-[2.2] tracking-wide text-jade-text-bright/80">
                    {exhibit.desc}
                  </p>
                  {exhibit.source && (
                    <a
                      href={exhibit.source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-jade-border/45 px-4 py-2 text-[0.72rem] uppercase tracking-[0.16em] text-jade-text-dim transition hover:border-jade-gold/50 hover:text-jade-gold"
                    >
                      来源 <FiExternalLink size={13} />
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={goNext} aria-label="下一件展品" className="absolute right-3 top-[180px] z-20 flex rounded-full border border-jade-border/45 bg-black/45 p-3 text-jade-text-dim backdrop-blur-md transition hover:border-jade-gold/45 hover:text-jade-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70 md:static md:p-4">
            <FiChevronRight size={24} strokeWidth={1} />
          </button>
        </div>
      </div>

    </div>
  )
}
