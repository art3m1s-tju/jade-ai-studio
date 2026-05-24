import { useEffect, useState } from 'react'
import { FiCheck, FiKey, FiLoader, FiShield } from 'react-icons/fi'

async function readJsonResponse(res) {
  const text = await res.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

export default function ApiKeyConfig() {
  const [apiKey, setApiKey] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/config/status')
      .then(readJsonResponse)
      .then((data) => {
        if (!cancelled) setIsConfigured(Boolean(data.dashscope_configured))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const saveKey = async () => {
    const value = apiKey.trim()
    if (!value) {
      setError('请输入阿里云 DashScope API Key')
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/config/dashscope-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: value, persist: true }),
      })
      const data = await readJsonResponse(res)
      if (!res.ok) throw new Error(data.detail || '保存失败')
      setApiKey('')
      setIsConfigured(true)
      setMessage('已写入本地 .env.local，并对当前后端生效')
    } catch (e) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-jade-border/45 bg-white/[0.035] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-jade-gold/30 bg-jade-gold/10 text-jade-gold">
            {isConfigured ? <FiCheck /> : <FiKey />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[0.86rem] font-medium text-jade-text-bright">阿里云 API Key 本地配置</h2>
              <span className={`rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.14em] ${isConfigured ? 'border-jade-gold/45 text-jade-gold' : 'border-jade-border/50 text-jade-text-dim'}`}>
                {isConfigured ? 'Ready' : 'Required'}
              </span>
            </div>
            <p className="mt-1 text-[0.74rem] leading-5 text-jade-text-dim">
              用于驱动通义万相生成玉器图像，并调用 Qwen 系列模型完成玉器解读。
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
          <label className="relative flex-1">
            <FiShield className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-jade-text-dim" size={15} />
            <input
              type="password"
              aria-label="阿里云 DashScope API Key"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(''); setMessage('') }}
              placeholder={isConfigured ? '更新 API Key' : '粘贴 DashScope API Key'}
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-jade-border/60 bg-black/20 pl-9 pr-3 text-[0.82rem] text-jade-text-bright outline-none transition placeholder:text-jade-text-dim/50 focus:border-jade-gold/55"
            />
          </label>
          <button
            onClick={saveKey}
            disabled={isSaving}
            className="h-11 rounded-xl bg-jade-gold px-4 text-[0.82rem] font-medium text-[#15120a] transition hover:bg-jade-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-jade-bg disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span className="flex items-center justify-center gap-2">
              {isSaving && <FiLoader className="animate-spin" />}
              保存配置
            </span>
          </button>
        </div>
      </div>
      {(message || error) && (
        <p role={error ? 'alert' : 'status'} className={`mt-3 text-center text-[0.72rem] tracking-[0.08em] ${error ? 'text-red-400/85' : 'text-jade-gold/80'}`}>
          {error || message}
        </p>
      )}
    </section>
  )
}
