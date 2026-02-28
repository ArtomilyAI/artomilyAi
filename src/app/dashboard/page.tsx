'use client'

import { useState } from 'react'
import { ContentPromptPanel } from '@/components/dashboard/content-prompt-panel'
import { ResultDisplay } from '@/components/dashboard/result-display'
import { TemplateHub } from '@/components/dashboard/template-hub'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  useTemplates, 
  useGenerations, 
  useUserWallet, 
  useGenerate,
  type Template,
  type Generation 
} from '@/hooks/use-queries'

export default function DashboardPage() {
  const [mode, setMode] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('IMAGE')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [prompt, setPrompt] = useState('')
  
  // Results state (not cached - UI state only)
  const [result, setResult] = useState<{
    image?: string | null
    video?: string | null
    caption?: string | null
    hashtags?: string[]
    generationId?: string
  }>({})
  const [error, setError] = useState<string | null>(null)

  // TanStack Query hooks
  const { data: walletData } = useUserWallet()
  const { data: templatesData } = useTemplates({ limit: 6 })
  const { data: generationsData } = useGenerations({ limit: 6 })
  const generateMutation = useGenerate()

  const credits = walletData?.balance ?? 0
  const recentGenerations = generationsData?.generations ?? []
  const templates = templatesData?.templates ?? []

  const handleGenerate = async (data: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO'
    prompt: string
    textType?: 'caption' | 'script' | 'copywriting'
    imageStyle?: string
    aspectRatio?: string
    duration?: number
    referenceUrl?: string
  }) => {
    setError(null)
    setResult({})

    try {
      const responseData = await generateMutation.mutateAsync(data)

      // Set result based on type
      if (data.type === 'VIDEO') {
        setResult({
          video: responseData.result,
          caption: null,
          hashtags: [],
          generationId: responseData.generationId,
        })
      } else if (data.type === 'IMAGE') {
        setResult({
          image: responseData.result,
          caption: null,
          hashtags: [],
          generationId: responseData.generationId,
        })
      } else {
        const caption = responseData.result
        const hashtags = extractHashtags(caption)
        setResult({
          image: null,
          caption,
          hashtags,
          generationId: responseData.generationId,
        })
      }

      // Clear template selection after successful generation
      setPrompt('')
      setSelectedTemplate(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  const handleSelectTemplate = async (template: Template) => {
    setSelectedTemplate(template)
    setPrompt(template.prompt)
    setMode(template.type as 'TEXT' | 'IMAGE' | 'VIDEO')
    
    // Increment template usage
    try {
      await fetch(`/api/templates/${template.id}/use`, { method: 'POST' })
    } catch (err) {
      console.error('Failed to increment template usage:', err)
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g) || []
    return matches.map((tag) => tag.replace('#', ''))
  }

  const handleDownload = () => {
    const url = result.image || result.video
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-10">
      {/* Mode Toggle */}
      <div className="inline-flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
        <button
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === 'IMAGE'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          onClick={() => setMode('IMAGE')}
        >
          <span>🖼️</span>
          Photo Mode
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === 'VIDEO'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          onClick={() => setMode('VIDEO')}
        >
          <span>🎬</span>
          Video Mode
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === 'TEXT'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          onClick={() => setMode('TEXT')}
        >
          <span>📝</span>
          Text Mode
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Content Prompt */}
        <div className="lg:col-span-5 space-y-6">
          <ContentPromptPanel
            onGenerate={handleGenerate}
            isGenerating={generateMutation.isPending}
            credits={credits}
            mode={mode}
            selectedTemplate={selectedTemplate}
            prompt={prompt}
            onPromptChange={setPrompt}
            onClearTemplate={() => {
              setSelectedTemplate(null)
              setPrompt('')
            }}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#506ced]">{credits}</div>
                <div className="text-sm text-slate-500">Credits Available</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {mode === 'TEXT' ? '1' : mode === 'IMAGE' ? '5' : '20'}
                </div>
                <div className="text-sm text-slate-500">Credits per {mode === 'TEXT' ? 'Text' : mode === 'IMAGE' ? 'Image' : 'Video'}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Result Display */}
        <div className="lg:col-span-7">
          <ResultDisplay
            image={result.image}
            video={result.video}
            caption={result.caption}
            hashtags={result.hashtags}
            generationId={result.generationId}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* Template Hub */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            🌟 Template Hub
          </h2>
          <a 
            href="/dashboard/templates" 
            className="text-sm text-[#506ced] hover:underline font-medium"
          >
            View All →
          </a>
        </div>
        <TemplateHub 
          onSelectTemplate={handleSelectTemplate} 
          templates={templates}
        />
      </div>

      {/* Recent Generations */}
      {recentGenerations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              📁 Recent Generations
            </h2>
            <a 
              href="/dashboard/library" 
              className="text-sm text-[#506ced] hover:underline font-medium"
            >
              View Library →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentGenerations.map((gen: Generation) => (
              <div
                key={gen.id}
                className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-square cursor-pointer hover:ring-2 hover:ring-[#506ced]/50 transition-all"
              >
                {gen.type === 'IMAGE' && gen.resultUrl ? (
                  <img
                    src={gen.resultUrl}
                    alt={gen.prompt}
                    className="w-full h-full object-cover"
                  />
                ) : gen.type === 'VIDEO' && gen.resultUrl ? (
                  <video src={gen.resultUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    <span className="text-3xl">
                      {gen.type === 'TEXT' ? '📝' : gen.type === 'VIDEO' ? '🎬' : '🔍'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                      {gen.type}
                    </Badge>
                    <p className="text-white text-xs truncate mt-1">{gen.prompt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 rounded-xl bg-red-500 text-white shadow-lg flex items-center gap-3 z-50">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
