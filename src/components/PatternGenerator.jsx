import { useState } from 'react'
import { FiLoader, FiDownload, FiRefreshCw, FiZap } from 'react-icons/fi'

const PRESET_PROMPTS = [
  { label: '龙纹玉佩', prompt: 'A photorealistic museum photograph of an authentic Chinese jade pendant, carved nephrite jade, dragon motif with swirling cloud patterns, soft translucent pale green-white stone with natural inclusions, polished to a waxy luster, dramatic museum spotlight on black velvet background, macro photography, 8k detail, the jade looks real and tangible with visible stone texture and subtle color variations' },
  { label: '谷纹玉璧', prompt: 'Photorealistic ancient Chinese jade bi disc, carved nephrite with raised grain patterns (gu wen), Warring States period style, deep celadon green jade with natural veining, waxy glossy surface from centuries of handling, dramatic side lighting revealing carved relief, museum artifact photography, authentic stone texture visible, pure black background' },
  { label: '如意玉佩', prompt: 'A photorealistic Chinese ruyi-shaped jade pendant, Qing dynasty imperial style, pure white hetian nephrite with subtle translucency, intricate openwork carving of intertwined vines and auspicious symbols, the stone surface showing natural waxy luster and microscopic texture, museum lighting, product photography on black velvet, tangible real jade material' },
  { label: '镂雕玉佩', prompt: 'A photorealistic Ming dynasty Chinese jade openwork plaque, multi-layered pierced carving of birds among flowering branches, translucent white-green nephrite jade, intricate details with visible tool marks and natural stone texture, dramatic backlighting showing translucency of thin carved sections, museum macro photography, tangible real material' },
]

const JADE_PATTERNS = ['云纹', '龙纹', '谷纹', '兽面纹', '凤鸟纹', '缠枝纹', '回纹']
const JADE_FORMS = ['玉佩', '玉璧', '玉琮', '玉如意', '山水牌']
const JADE_COLORS = ['羊脂白玉', '青白玉', '碧玉', '墨玉', '黄玉']

const FORM_PROMPTS = {
  玉佩: 'a flat wearable Chinese jade pendant plaque with a suspension hole, palm-sized, thin carved slab, not a freestanding statue',
  玉璧: 'a circular Chinese jade bi disc with a perfect central round hole, flat ritual disc form, low relief carving',
  玉琮: 'a square outer and round inner Chinese jade cong ritual tube, upright geometric ritual vessel, not an animal figure',
  玉如意: 'a Chinese jade ruyi scepter or ruyi-head pendant, flattened curved handle with lingzhi-cloud shaped head, elegant ceremonial object, not an animal statue',
  山水牌: 'a rectangular Chinese jade landscape plaque, flat pendant tablet with shallow relief mountain-and-water scene',
}

const PATTERN_PROMPTS = {
  云纹: 'stylized Chinese cloud-scroll ornament carved as shallow relief lines',
  龙纹: 'archaic Chinese dragon-scroll motif carved on the surface as ornament, not a dragon body statue',
  谷纹: 'raised grain pattern, dense small rounded bosses arranged in ritual jade style',
  兽面纹: 'taotie beast-mask motif, symmetrical ancient bronze-style mask pattern carved only as surface ornament, not a cat, not a dog, not an animal body',
  凤鸟纹: 'phoenix-bird motif carved as elegant linear ornament, not a full bird statue',
  缠枝纹: 'interlocking vine-scroll floral ornament in shallow relief',
  回纹: 'Chinese key-fret geometric meander border pattern',
}

const COLOR_PROMPTS = {
  羊脂白玉: 'warm mutton-fat white Hetian nephrite, soft translucent waxy luster',
  青白玉: 'pale celadon-white nephrite with subtle cloudy translucency',
  碧玉: 'deep spinach-green nephrite, natural mineral speckles, waxy stone luster, not plastic',
  墨玉: 'dark black-green nephrite with understated translucency at thin edges',
  黄玉: 'warm honey-yellow nephrite with natural stone texture',
}

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
      className={`rounded-full border px-3.5 py-2 text-[0.82rem] transition-all duration-300 cursor-pointer
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
    setActivePreset(idx)
    setSelectedPatterns([])
    setSelectedForms([])
    setSelectedColor('')
    setCustomPrompt('')
  }

  const buildPrompt = () => {
    if (activePreset !== null) return PRESET_PROMPTS[activePreset].prompt

    const primaryForm = selectedForms[0]
    let parts = [
      'Photorealistic museum catalog photograph of one authentic ancient Chinese carved jade artifact.',
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

  const handleGenerate = async () => {
    const prompt = buildPrompt()
    if (!prompt.trim() || prompt === 'A photorealistic museum photograph of an authentic carved Chinese jade artifact, polished waxy luster surface, visible natural stone texture and subtle color variations, soft museum spotlight on pure black background, macro photography, 8k detail, photorealistic tangible authentic jade material') { 
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
        body: JSON.stringify({ prompt, negative_prompt: NEGATIVE_PROMPT, patterns: selectedPatterns, forms: selectedForms, color: selectedColor }),
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
        <aside className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6 lg:col-span-4">
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-[0.7rem] uppercase tracking-[0.18em] text-jade-gold/80">灵感预设</h3>
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
                transition-all duration-300 hover:bg-jade-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative flex items-center justify-center gap-2.5 text-[0.95rem] font-medium">
                {isGenerating ? <FiLoader className="animate-spin" /> : <FiZap />}
                {isGenerating ? '雕琢中...' : '开始生成'}
              </span>
            </button>
            {error && <p className="text-red-400/80 text-[0.75rem] text-center mt-4 tracking-widest">{error}</p>}
            </section>
          </div>
        </aside>

        <section className="min-w-0 lg:col-span-8">
          <div className="glass-panel group relative flex min-h-[560px] overflow-hidden rounded-2xl border border-jade-border/50 lg:min-h-[660px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.1),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_42%)] pointer-events-none" />

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
                <div className="w-16 h-16 border-t-2 border-r-2 border-jade-gold rounded-full animate-spin opacity-80" />
                <p className="font-serif text-jade-gold/80 text-[0.9rem] tracking-[0.2em] animate-pulse">A I 雕 琢 中</p>
              </div>
            ) : generatedImage ? (
              <div className="animate-fade-in relative flex-1 flex flex-col h-full z-10">
                <div className="relative flex min-h-[560px] w-full flex-1 items-center justify-center p-4 sm:p-8">
                  <img src={generatedImage} alt="玉器" className="max-h-[620px] max-w-full rounded-xl object-contain shadow-2xl" />
                </div>
                
                <div className="absolute bottom-5 right-5 flex gap-3 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                  <button onClick={() => { const a = document.createElement('a'); a.href = generatedImage; a.download = 'jade.png'; a.click() }}
                    className="glass-panel flex h-11 w-11 items-center justify-center rounded-full text-jade-text-bright shadow-xl transition-all cursor-pointer hover:border-jade-gold/50 hover:text-jade-gold">
                    <FiDownload size={18} />
                  </button>
                  <button onClick={handleGenerate}
                    className="glass-panel flex h-11 w-11 items-center justify-center rounded-full text-jade-text-bright shadow-xl transition-all cursor-pointer hover:border-jade-gold/50 hover:text-jade-gold">
                    <FiRefreshCw size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="h-px w-20 bg-jade-gold/40" />
                <p className="font-serif text-[1.2rem] text-jade-gold">等待唤醒</p>
                <p className="max-w-sm text-[0.86rem] font-light leading-7 text-jade-text-dim">
                  选择左侧灵感或元素，AI 将在此处呈现独一无二的玉器设计。
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
