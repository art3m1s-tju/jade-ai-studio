import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const EXHIBITS = [
  { id: 1, name: 'C 形 玉 龙', era: '红山文化', date: '约公元前 4000-3000 年', material: '岫岩玉', motif: '龙形崇拜', highlight: '从装饰走向礼仪象征', desc: '中华第一龙。蜷曲的 C 形身躯展现了先民对龙的想象与崇拜，墨绿色岫岩玉，通体光素，造型简洁而充满原始力量感，标志着中国玉文化从装饰品向礼器过渡的关键一步。', audioText: '红山文化C形玉龙，被誉为中华第一龙。', color: '#1A4D3E', image: '/gallery/hongshan-jade-dragon.jpg' },
  { id: 2, name: '玉 琮', era: '良渚文化', date: '约公元前 3300-2300 年', material: '透闪石玉', motif: '神人兽面纹', highlight: '天圆地方的宇宙观', desc: '良渚文化最具代表性的玉礼器，外方内圆，象征天圆地方。器表刻有精细的神人兽面纹，是研究中国早期宗教与王权的重要物证，被誉为玉器之王。', audioText: '良渚文化玉琮，外方内圆，象征天圆地方。', color: '#D4AF37', image: '/gallery/liangzhu-jade-cong.jpg' },
  { id: 3, name: '玉 璧', era: '商周时期', date: '约公元前 1600-256 年', material: '青玉 / 白玉', motif: '谷纹、蒲纹、龙纹', highlight: '祭天与朝聘礼器', desc: '玉璧是玉文化中最重要、延续时间最长的器型。圆形中孔，象征天，用于祭天、朝聘、盟誓等重大礼仪场合，常见龙纹、谷纹等精细纹饰。', audioText: '商周玉璧，圆形中孔，象征天。', color: '#888888', image: '/gallery/jade-bi-disc.jpg' },
  { id: 4, name: '玉 组 佩', era: '春秋战国', date: '约公元前 770-221 年', material: '青白玉', motif: '龙凤、云雷、谷纹', highlight: '身份秩序与行走礼乐', desc: '组佩由多件玉璜、玉珩、玉管、玉珠组合垂挂，行动时相互碰撞发声。它不只是装饰，更承担节制步履、呈现礼仪身份的作用，体现先秦贵族对身体、声音与秩序的精密经营。', audioText: '春秋战国玉组佩，以玉声与佩饰体现礼仪身份。', color: '#9AB7A8', image: '/gallery/jade-bi-disc.jpg' },
  { id: 5, name: '出 廓 玉 璧', era: '战国时期', date: '约公元前 475-221 年', material: '青玉', motif: '龙纹、凤鸟纹', highlight: '平面礼器转向立体叙事', desc: '战国出廓璧在圆璧之外伸展龙凤或卷云装饰，突破了单纯几何形制。内外空间彼此呼应，既保留祭礼意味，也把纹饰的动态张力推到更具观赏性的层次。', audioText: '战国出廓玉璧，将龙凤纹饰延展到璧外。', color: '#6F927F', image: '/gallery/jade-bi-disc.jpg' },
  { id: 6, name: '玉 蝉', era: '汉代', date: '公元前 202-公元 220 年', material: '白玉 / 青玉', motif: '蝉形', highlight: '汉八刀的生命寓意', desc: '汉代丧葬用玉典型，以极简的"汉八刀"技法雕琢，寥寥数刀便刻画出蝉的形态。放置在逝者口中，寓意"蝉蜕复生"，线条简洁有力，充满生命的张力。', audioText: '汉代玉蝉，以著名的汉八刀技法雕琢。', color: '#E5E5E5', image: '/gallery/han-jade-cicada.jpg' },
  { id: 7, name: '玉 辟 邪', era: '汉魏时期', date: '约公元 1-3 世纪', material: '黄玉 / 青玉', motif: '神兽瑞兽', highlight: '镇护与升仙想象', desc: '辟邪以昂首、展翼、伏踞的神兽姿态出现，兼具动物肌理与想象性结构。它凝结了汉代关于驱邪、镇墓与升仙的观念，也体现圆雕玉器在体量和气势上的成熟。', audioText: '汉魏玉辟邪，承载镇护与升仙的想象。', color: '#B28C45', image: '/gallery/hongshan-jade-dragon.jpg' },
  { id: 8, name: '玉 带 板', era: '唐宋时期', date: '约公元 618-1279 年', material: '白玉 / 青玉', motif: '花鸟、人物、瑞兽', highlight: '制度服饰中的玉德', desc: '玉带板嵌缀于革带之上，是等级服饰的重要组成。唐宋以后，花鸟、人物与瑞兽题材逐渐丰富，玉器从祭礼系统延伸到官服制度和日常审美之中。', audioText: '唐宋玉带板，将玉器纳入服饰等级与审美体系。', color: '#C9C2A6', image: '/gallery/liangzhu-jade-cong.jpg' },
  { id: 9, name: '白 玉 如 意', era: '明清时期', date: '约公元 1368-1912 年', material: '和田白玉', motif: '灵芝、云纹、蝙蝠', highlight: '吉祥语汇的集成', desc: '如意在明清时期成为宫廷与文人空间中的典型陈设。器形取灵芝、祥云之意，常配蝙蝠、寿桃、缠枝花卉等图像，将祝愿、赏玩与材料美感凝为一体。', audioText: '明清白玉如意，是吉祥寓意与材质审美的结合。', color: '#F0E7CF', image: '/gallery/han-jade-cicada.jpg' },
  { id: 10, name: '山 水 玉 牌', era: '清代', date: '约公元 1644-1912 年', material: '白玉 / 碧玉', motif: '山水、诗文、亭台', highlight: '掌中可游的文人景观', desc: '山水玉牌将浅浮雕、阴刻诗文与牌形构图结合，常以一面刻景、一面题句的方式呈现。它把山水画的空间经营转译为玉石肌理，成为可佩可赏的微型文人世界。', audioText: '清代山水玉牌，将山水诗画浓缩于掌中。', color: '#7EA38D', image: '/gallery/jade-bi-disc.jpg' },
]

export default function DigitalGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrls, setAudioUrls] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const audioRef = useRef(null)

  const exhibit = EXHIBITS[activeIndex]

  const goNext = () => { setActiveIndex((prev) => (prev + 1) % EXHIBITS.length); setIsPlaying(false); }
  const goPrev = () => { setActiveIndex((prev) => (prev - 1 + EXHIBITS.length) % EXHIBITS.length); setIsPlaying(false); }

  const handleAudio = async () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); return; }
    
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
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-10">
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

      {/* Main Exhibition Area */}
      <div className="relative">
        
        <div className="flex items-center justify-between gap-4 md:gap-10">
          <button onClick={goPrev} className="hidden md:flex p-4 text-jade-text-dim hover:text-jade-gold transition-colors z-20">
            <FiChevronLeft size={24} strokeWidth={1} />
          </button>

          <div className="flex-1 glass-panel rounded-2xl overflow-hidden min-h-[560px] relative z-10 flex flex-col md:flex-row border border-jade-border/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={exhibit.id}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col md:flex-row w-full"
              >
                <div className="md:w-1/2 min-h-[360px] flex items-center justify-center relative border-b md:border-b-0 md:border-r border-jade-border/30 bg-black/25 overflow-hidden">
                  <div className="absolute inset-0 opacity-45">
                    <img src={exhibit.image} alt="" className="h-full w-full object-cover blur-2xl scale-110 opacity-35" />
                    <div className="absolute inset-0 bg-black/70" />
                  </div>

                  <div className="absolute w-56 h-56 rounded-full blur-[70px] animate-breath" style={{ backgroundColor: exhibit.color, opacity: 0.18 }} />

                  <div className="relative z-10 mx-6 aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-2xl border border-white/12 bg-black/35 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
                    <img
                      src={exhibit.image}
                      alt={exhibit.name}
                      className="h-full w-full object-contain p-5"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_34%,rgba(0,0,0,0.25))]" />
                  </div>
                </div>

                {/* Plaque Description */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-jade-gold/60 text-[0.65rem] tracking-[0.3em] uppercase mb-2">{exhibit.era}</p>
                      <h3 className="font-serif text-[2.1rem] text-jade-text-bright font-light">{exhibit.name}</h3>
                    </div>
                    <button 
                      onClick={handleAudio}
                      disabled={isGenerating}
                      className="w-10 h-10 rounded-full border border-jade-border/40 flex items-center justify-center text-jade-gold/70 hover:border-jade-gold hover:text-jade-gold transition-all"
                    >
                      {isGenerating ? <div className="w-4 h-4 border-t-2 border-jade-gold rounded-full animate-spin" /> : (isPlaying ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />)}
                    </button>
                  </div>

                  <p className="text-jade-text-dim text-[0.7rem] tracking-[0.2em] mb-6 font-light uppercase">{exhibit.date}</p>
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
                  
                  <p className="text-jade-text-bright/80 text-[0.9rem] leading-[2.2] tracking-wide font-light">
                    {exhibit.desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={goNext} className="hidden md:flex p-4 text-jade-text-dim hover:text-jade-gold transition-colors z-20">
            <FiChevronRight size={24} strokeWidth={1} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">
        {EXHIBITS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(idx)}
            className={`group rounded-xl border p-3 text-left transition-all cursor-pointer
              ${idx === activeIndex
                ? 'border-jade-gold/60 bg-jade-gold/12 text-jade-text-bright'
                : 'border-jade-border/45 bg-white/[0.035] text-jade-text-dim hover:border-jade-gold/35 hover:text-jade-text-bright'
              }`}
          >
            <span className="block text-[0.6rem] uppercase tracking-[0.18em] text-jade-gold/60">{String(item.id).padStart(2, '0')}</span>
            <span className="mt-2 block truncate text-[0.8rem]">{item.name.replace(/\s/g, '')}</span>
            <span className="mt-1 block truncate text-[0.68rem] text-jade-text-dim/70">{item.era}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
