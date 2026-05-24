import { useState } from 'react'
import { FiLoader, FiDownload, FiRefreshCw, FiZap, FiCopy, FiImage } from 'react-icons/fi'
import {
  COLOR_PROMPTS,
  FORM_PROMPTS,
  JADE_COLORS,
  JADE_FORMS,
  JADE_PATTERNS,
  PATTERN_PROMPTS,
  PRESET_PROMPTS,
  pickReferences,
} from '../data/jadeCatalog'

const NEGATIVE_PROMPT = [
  'cartoon',
  'cute mascot',
  'toy',
  'plastic',
  'resin',
  '3d character',
  'cat',
  'dog',
  'tiger figurine',
  'lion statue',
  'animal body statue',
  'modern souvenir',
  'cheap trinket',
  'glowing neon',
  'oversaturated',
  'painted enamel',
  'metal object',
  'ceramic',
  'low quality',
  'deformed artifact',
].join(', ')

async function readJsonResponse(res) {
  const text = await res.text()
  if (!text.trim()) {
    throw new Error(res.ok ? '生成服务返回空结果' : `生成服务无响应（HTTP ${res.status}）`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('生成服务返回格式异常，请稍后重试')
  }
}

function GlassChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-[0.82rem] transition-all duration-300 cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-jade-bg
        ${active
          ? 'bg-jade-gold text-[#15120a] border-jade-gold shadow-[0_10px_24px_rgba(212,175,55,0.16)]'
          : 'bg-white/[0.045] text-jade-text-dim border-jade-border/70 hover:border-jade-gold/45 hover:text-jade-text-bright hover:bg-white/[0.08]'
        }`}
    >
      {children}
    </button>
  )
}

export default function PatternGenerator() {
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedPatterns, setSelectedPatterns] = useState([])
  const [selectedForms, setSelectedForms] = useState([])
  const [selectedColor, setSelectedColor] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [geneAnalysis, setGeneAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [activePreset, setActivePreset] = useState(null)

  const toggleItem = (item, list, setList) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
    setActivePreset(null)
  }

  const selectForm = (form) => {
    setSelectedForms(selectedForms.includes(form) ? [] : [form])
    setActivePreset(null)
  }

  const selectPreset = (idx) => {
    const preset = PRESET_PROMPTS[idx]
    setActivePreset(idx)
    setSelectedPatterns(preset.patterns)
    setSelectedForms([preset.form])
    setSelectedColor(preset.color)
    setCustomPrompt('')
  }

  const buildPrompt = () => {
    const primaryForm = selectedForms[0]
    let parts = [
      'Photorealistic museum catalog photograph of one authentic ancient Chinese carved jade artifact, highly faithful to the supplied reference images.',
      'Strict artifact design, refined archaeological object, black velvet display background, soft directional museum spotlight.',
    ]
    if (primaryForm) parts.push(`Primary object form: ${FORM_PROMPTS[primaryForm] || primaryForm}.`)
    if (selectedForms.length > 1) parts.push(`Subtle secondary references only: ${selectedForms.slice(1).join(', ')}.`)
    if (selectedPatterns.length > 0) {
      parts.push(`Surface carving motifs: ${selectedPatterns.map((pattern) => PATTERN_PROMPTS[pattern] || pattern).join('; ')}.`)
      parts.push('The motifs must appear as carved relief or incised decoration on the jade surface, not as the overall body shape.')
    }
    if (selectedColor) parts.push(`Material and color: ${COLOR_PROMPTS[selectedColor] || selectedColor}.`)
    if (customPrompt) parts.push(`Additional curator note: ${customPrompt}.`)
    parts.push(
      'Thin translucent edges where appropriate, natural inclusions, subtle color variation, hand-polished waxy nephrite surface, visible carving tool softness.',
      'Elegant, restrained, historically plausible Chinese jade design, not cute, not cartoonish, not a modern toy.',
      'High detail macro product photography, centered composition, 8k detail.'
    )
    return parts.join(' ')
  }

  const selectedReferenceImages = pickReferences({
    form: selectedForms[0],
    patterns: selectedPatterns,
    color: selectedColor,
  })

  const handleGenerate = async () => {
    const prompt = buildPrompt()
    if (!selectedForms.length && !selectedPatterns.length && !selectedColor && !customPrompt.trim()) {
      setError('请选择元素或预设')
      return
    }
    setError('')
    setIsGenerating(true)
    setGeneratedImage(null)
    setGeneAnalysis(null)

    try {
      const res = await fetch('/api/generate-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: NEGATIVE_PROMPT,
          patterns: selectedPatterns,
          forms: selectedForms,
          color: selectedColor,
          mode: selectedReferenceImages.length ? 'image_reference' : 'text_to_image',
          model: 'wan2.5-i2i-preview',
          size: '1024*1024',
          n: 1,
          watermark: false,
          reference_images: selectedReferenceImages.map((item, index) => ({
            url: item.image,
            fallback_url: item.fallbackImage,
            role: index === 0 ? 'shape' : (item.patterns.some((pattern) => selectedPatterns.includes(pattern)) ? 'pattern' : 'material'),
            title: item.title,
            instruction: item.instruction,
          })),
        }),
      })
      const data = await readJsonResponse(res)
      if (!res.ok) throw new Error(data.detail || '生成失败')
      if (!data.image_url) throw new Error('生成服务未返回图片地址')
      setGeneratedImage(data.image_url)
      setGeneAnalysis(data.analysis)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-serif text-[0.68rem] uppercase tracking-[0.24em] text-jade-gold/70">Creation Console</p>
          <h2 className="font-serif text-[1.7rem] font-light text-jade-text-bright sm:text-[2.1rem]">创作 · 赋灵</h2>
        </div>
        <p className="max-w-xl text-[0.86rem] leading-7 text-jade-text-dim">
          选择器型、纹饰与玉质，生成具备博物馆摄影质感的玉器纹样方案。
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        <aside className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6 lg:col-span-4 lg:h-full">
          <div className="flex h-full flex-col space-y-6">
            <section>
              <h3 className="mb-3 text-[0.7rem] uppercase tracking-[0.18em] text-jade-gold/80">高相似参考预设</h3>
              <div className="flex flex-wrap gap-2.5">
              {PRESET_PROMPTS.map((p, i) => (
                <GlassChip key={i} active={activePreset === i} onClick={() => selectPreset(i)}>
                  {p.label}
                </GlassChip>
              ))}
              </div>
            </section>

            <section className="border-t border-jade-border/40 pt-6">
              <h3 className="mb-4 text-[0.7rem] uppercase tracking-[0.18em] text-jade-gold/80">元素定制</h3>
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[0.76rem] text-jade-text-bright/65">器型</p>
                  <div className="flex flex-wrap gap-2.5">
                  {JADE_FORMS.map(f => (
                    <GlassChip key={f} active={selectedForms.includes(f)} onClick={() => selectForm(f)}>{f}</GlassChip>
                  ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[0.76rem] text-jade-text-bright/65">纹饰</p>
                  <div className="flex flex-wrap gap-2.5">
                  {JADE_PATTERNS.map(p => (
                    <GlassChip key={p} active={selectedPatterns.includes(p)} onClick={() => toggleItem(p, selectedPatterns, setSelectedPatterns)}>{p}</GlassChip>
                  ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[0.76rem] text-jade-text-bright/65">玉质</p>
                  <div className="flex flex-wrap gap-2.5">
                  {JADE_COLORS.map(c => (
                    <GlassChip key={c} active={selectedColor === c} onClick={() => { setSelectedColor(selectedColor === c ? '' : c); setActivePreset(null) }}>{c}</GlassChip>
                  ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[0.76rem] text-jade-text-bright/65">补充描述</span>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => { setCustomPrompt(e.target.value); setActivePreset(null) }}
                    placeholder="例如：薄胎透雕、背光透玉、器身微沁色"
                    className="min-h-24 w-full resize-none rounded-xl border border-jade-border/70 bg-black/18 px-3.5 py-3 text-[0.84rem] leading-6 text-jade-text-bright outline-none transition placeholder:text-jade-text-dim/45 focus:border-jade-gold/50"
                  />
                </label>
              </div>
            </section>

            <section className="pt-1">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="group relative w-full overflow-hidden rounded-xl bg-jade-gold px-5 py-4 text-[#15120a] shadow-[0_18px_38px_rgba(212,175,55,0.16)]
                transition-all duration-300 hover:bg-jade-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-jade-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative flex items-center justify-center gap-2.5 text-[0.95rem] font-medium">
                {isGenerating ? <FiLoader className="animate-spin" /> : <FiZap />}
                {isGenerating ? '雕琢中...' : '开始生成'}
              </span>
            </button>
            {error && <p role="alert" className="text-red-400/80 text-[0.75rem] text-center mt-4 tracking-widest">{error}</p>}
            </section>
          </div>
        </aside>

        <section className="min-w-0 lg:col-span-8 lg:flex lg:h-full lg:flex-col">
          <div className="glass-panel group relative flex min-h-[360px] flex-1 overflow-hidden rounded-2xl border border-jade-border/50 sm:min-h-[560px] lg:min-h-[660px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.1),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_42%)] pointer-events-none" />

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
                <div className="w-16 h-16 border-t-2 border-r-2 border-jade-gold rounded-full animate-spin opacity-80" />
                <p className="font-serif text-jade-gold/80 text-[0.9rem] tracking-[0.2em] animate-pulse">A I 雕 琢 中</p>
              </div>
            ) : generatedImage ? (
              <div className="animate-fade-in relative flex-1 flex flex-col h-full z-10">
                <div className="relative flex min-h-[360px] w-full flex-1 items-center justify-center p-4 sm:min-h-[560px] sm:p-8">
                  <img
                    src={generatedImage}
                    alt="玉器"
                    onError={() => setError('生成图片链接已失效，请按当前参考图重新生成')}
                    className="max-h-[620px] max-w-full rounded-xl object-contain shadow-2xl"
                  />
                </div>
                
                <div className="absolute bottom-5 right-5 flex gap-3 rounded-full bg-black/45 p-1.5 backdrop-blur-md opacity-100 transition-opacity duration-300 sm:bg-transparent sm:p-0 sm:opacity-0 sm:group-hover:opacity-100">
                  <button onClick={() => navigator.clipboard?.writeText(buildPrompt())}
                    aria-label="复制提示词"
                    className="glass-panel flex h-11 w-11 items-center justify-center rounded-full text-jade-text-bright shadow-xl transition-all cursor-pointer hover:border-jade-gold/50 hover:text-jade-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70">
                    <FiCopy size={18} />
                  </button>
                  <button onClick={() => { const a = document.createElement('a'); a.href = generatedImage; a.download = 'jade.png'; a.click() }}
                    aria-label="下载图片"
                    className="glass-panel flex h-11 w-11 items-center justify-center rounded-full text-jade-text-bright shadow-xl transition-all cursor-pointer hover:border-jade-gold/50 hover:text-jade-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70">
                    <FiDownload size={18} />
                  </button>
                  <button onClick={handleGenerate}
                    aria-label="按当前参考图重新生成"
                    className="glass-panel flex h-11 w-11 items-center justify-center rounded-full text-jade-text-bright shadow-xl transition-all cursor-pointer hover:border-jade-gold/50 hover:text-jade-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold/70">
                    <FiRefreshCw size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="h-px w-20 bg-jade-gold/40" />
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-jade-gold/35 bg-jade-gold/8 text-jade-gold">
                  <FiImage size={24} />
                </div>
                <p className="font-serif text-[1.2rem] text-jade-gold">参考图驱动生成</p>
                <p className="max-w-sm text-[0.86rem] font-light leading-7 text-jade-text-dim">
                  选择左侧灵感或元素后，系统会先匹配馆藏参考图，再生成更接近真实玉器器型与材质的设计。
                </p>
                <div className="h-px w-20 bg-jade-gold/40" />
              </div>
            )}
          </div>

          {geneAnalysis && (
            <div className="mt-8 pt-8 border-t border-jade-border/40 animate-fade-in-up">
              <h4 className="font-serif text-jade-gold text-[0.8rem] tracking-[0.2em] mb-4">纹 样 基 因 解 析</h4>
              <p className="text-jade-text-bright/80 text-[0.85rem] leading-[2.2] tracking-wide font-light">
                {geneAnalysis}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
