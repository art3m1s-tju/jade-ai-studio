import { useState } from 'react'
import Header from './components/Header'
import PatternGenerator from './components/PatternGenerator'
import JadeAnalyzer from './components/JadeAnalyzer'
import DigitalGallery from './components/DigitalGallery'

const tabs = [
  { id: 'generate', label: '纹样生成', subtitle: 'AI Pattern' },
  { id: 'analyze', label: '玉器解读', subtitle: 'AI Analysis' },
  { id: 'gallery', label: '数字展廊', subtitle: 'Gallery' },
]

function App() {
  const [activeTab, setActiveTab] = useState('generate')

  return (
    <div className="min-h-screen overflow-x-hidden bg-jade-bg text-jade-text">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,rgba(36,101,83,0.18),transparent_28%),linear-gradient(225deg,rgba(210,174,85,0.12),transparent_24%),linear-gradient(180deg,#080b0a_0%,#0b0d0c_50%,#070807_100%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <Header />

        <div className="sticky top-4 z-50 mx-auto mt-6 w-full max-w-3xl">
          <nav className="glass-nav grid grid-cols-3 gap-1 rounded-full p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative min-h-12 rounded-full px-3 text-center transition-all duration-300 cursor-pointer
                  ${activeTab === tab.id
                    ? 'bg-jade-gold text-[#15120a] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
                    : 'text-jade-text-dim hover:bg-white/6 hover:text-jade-text-bright'
                  }`}
              >
                <span className="block text-[0.82rem] font-medium tracking-[0.08em] sm:text-[0.9rem]">{tab.label}</span>
                <span className={`mt-0.5 hidden text-[0.58rem] uppercase tracking-[0.18em] sm:block ${activeTab === tab.id ? 'text-black/55' : 'text-jade-text-dim/55'}`}>
                  {tab.subtitle}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <main className="flex-1 py-8 sm:py-10 lg:py-12">
          <div className="animate-fade-in-up" key={activeTab}>
            {activeTab === 'generate' && <PatternGenerator />}
            {activeTab === 'analyze' && <JadeAnalyzer />}
            {activeTab === 'gallery' && <DigitalGallery />}
          </div>
        </main>

        <footer className="border-t border-jade-border/35 py-6 text-center">
          <p className="font-serif text-[0.65rem] uppercase tracking-[0.28em] text-jade-text-dim/55">
            Jade Pattern AI Studio
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
