import { useState, useRef } from 'react'
import { FiUpload, FiLoader } from 'react-icons/fi'

export default function JadeAnalyzer() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!image) { setError('请先上传图片'); return }
    setError('')
    setIsAnalyzing(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('image', image)
      const res = await fetch('/api/analyze-jade', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || '分析失败')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Title Section */}
      <div className="text-center space-y-4">
        <h2 className="font-serif text-[2rem] text-jade-text-bright font-light tracking-[0.15em]">鉴 赏 · 解 读</h2>
        <div className="w-12 h-[1px] bg-jade-gold/40 mx-auto" />
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-stretch">
        {/* Upload Zone - Left */}
        <div className="lg:col-span-5 flex h-full flex-col space-y-8">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex min-h-[500px] flex-1 flex-col items-center justify-center rounded-3xl cursor-pointer transition-all duration-500
              border border-dashed backdrop-blur-sm
              ${imagePreview 
                ? 'border-jade-gold/20 bg-jade-gold/5' 
                : 'border-jade-border/40 hover:border-jade-gold/40 hover:bg-white/5 bg-transparent'}`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            
            {imagePreview ? (
              <div className="absolute inset-2 rounded-[1.2rem] overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[0.8rem] tracking-widest border border-white/40 px-4 py-2 rounded-full backdrop-blur-md">更换图片</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center px-8 relative z-10">
                <div className="w-16 h-16 mx-auto rounded-full border border-jade-border/40 flex items-center justify-center group-hover:border-jade-gold/40 transition-colors">
                  <FiUpload className="text-xl text-jade-text-dim group-hover:text-jade-gold transition-colors" />
                </div>
                <div>
                  <p className="font-serif text-jade-text-bright text-[0.9rem] tracking-[0.1em] mb-2">点击或拖拽上传</p>
                  <p className="text-jade-text-dim/60 text-[0.7rem] font-light tracking-widest uppercase">Support JPG / PNG</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="group relative w-full py-4 bg-transparent border border-jade-gold/30 rounded-2xl overflow-hidden
              transition-all duration-500 hover:border-jade-gold/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-jade-gold/5 via-jade-gold/10 to-jade-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center justify-center gap-3 font-serif text-[0.9rem] text-jade-gold tracking-[0.2em]">
              {isAnalyzing ? <FiLoader className="animate-spin" /> : '开 始 解 读'}
            </span>
          </button>
          
          {error && <p className="text-red-400/80 text-[0.75rem] text-center tracking-widest">{error}</p>}
        </div>

        {/* Results Plaque - Right */}
        <div className="lg:col-span-7 flex h-full">
          <div className="glass-panel relative flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-3xl p-10 md:p-14">
            
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-jade-green-dim blur-[80px] rounded-full pointer-events-none opacity-40" />
            
            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-jade-gold to-transparent animate-pulse" />
                <p className="font-serif text-jade-gold/60 text-[0.8rem] tracking-[0.2em]">正在凝视跨越千年的纹理</p>
                <div className="w-px h-16 bg-gradient-to-b from-jade-gold via-transparent to-transparent animate-pulse delay-150" />
              </div>
            ) : result ? (
              <div className="animate-fade-in space-y-10 relative z-10">
                <div className="text-center pb-8 border-b border-jade-border/40">
                  <h3 className="font-serif text-[1.5rem] text-jade-text-bright tracking-[0.2em] mb-2">{result.form || '未知名器'}</h3>
                  <p className="text-jade-gold/60 text-[0.75rem] tracking-[0.3em] uppercase">{result.era || '年代不详'}</p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: '材质特征', value: result.material },
                    { label: '纹饰解析', value: result.pattern },
                    { label: '琢玉工艺', value: result.craftsmanship },
                    { label: '文化寓意', value: result.cultural_meaning },
                  ].map(({ label, value }) => value && (
                    <div key={label} className="group">
                      <h4 className="text-jade-text-dim/60 text-[0.65rem] tracking-[0.2em] uppercase mb-2">{label}</h4>
                      <p className="text-jade-text-bright/90 text-[0.85rem] leading-[2] tracking-wide font-light">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 opacity-30">
                <div className="w-8 h-[1px] bg-jade-text-dim" />
                <p className="font-serif text-jade-text-dim text-[0.85rem] tracking-[0.2em]">博物院展台</p>
                <div className="w-8 h-[1px] bg-jade-text-dim" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
