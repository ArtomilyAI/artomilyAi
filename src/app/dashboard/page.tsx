'use client'

import { useState, useEffect } from 'react'
import { ContentPromptPanel } from '@/components/dashboard/content-prompt-panel'
import { ResultDisplay } from '@/components/dashboard/result-display'
import { TemplateHub } from '@/components/dashboard/template-hub'
import { GenerationLoadingModal, advanceGenerationStep } from '@/components/dashboard/generation-loading-modal'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Image, 
  Video, 
  FileText,
  Zap,
  Star,
  FolderOpen,
  AlertTriangle,
  X
} from 'lucide-react'
import { 
  useTemplates, 
  useGenerations, 
  useUserWallet, 
  useGenerate,
  useGenerationStatus,
  type Template,
  type Generation 
} from '@/hooks/use-queries'

export default function DashboardPage() {
  const [mode, setMode] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('IMAGE')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [prompt, setPrompt] = useState('')
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null)
  const [isModalComplete, setIsModalComplete] = useState(false)
  const [pendingGenerationId, setPendingGenerationId] = useState<string | null>(null)
  const [pendingGenerationType, setPendingGenerationType] = useState<'TEXT' | 'IMAGE' | 'VIDEO' | null>(null)
  const [pendingGenerateMetadata, setPendingGenerateMetadata] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState('')
  
  // Results state (not cached - UI state only)
  const [result, setResult] = useState<{
    image?: string | null
    video?: string | null
    caption?: string | null
    hashtags?: string[]
    generationId?: string
  }>({})
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('IMAGE')

  // TanStack Query hooks
  const { data: walletData } = useUserWallet()
  const { data: templatesData } = useTemplates({ limit: 6 })
  const { data: generationsData, refetch: refetchGenerations } = useGenerations({ limit: 6 })
  const generateMutation = useGenerate()
  
  // Poll for generation status when there's a pending generation
  const { data: generationStatus } = useGenerationStatus(pendingGenerationId, {
    enabled: !!pendingGenerationId,
  })

  const credits = walletData?.balance ?? 0
  const recentGenerations = generationsData?.generations ?? []
  const templates = templatesData?.templates ?? []

  // Extract hashtags helper
  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g) || []
    return matches.map((tag) => tag.replace('#', ''))
  }

  // Generate caption for image/video with context
  const generateCaptionAndHashtags = async (imageUrl: string, type: 'IMAGE' | 'VIDEO', prompt: string) => {
    try {
      advanceGenerationStep() // Move to caption step
      
      // Create a more contextual prompt that includes the original generation context
      const contextualPrompt = type === 'IMAGE' 
        ? `Write an engaging social media caption for this image. The image was generated based on this prompt: "${prompt}". Include relevant hashtags at the end.`
        : `Write an engaging social media caption for this video. The video was generated based on this prompt: "${prompt}". Include relevant hashtags at the end.`
      
      const captionResponse = await fetch('/api/generate/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          prompt: prompt,
        }),
      })
      
      if (captionResponse.ok) {
        const captionData = await captionResponse.json()
        advanceGenerationStep() // Move to hashtags step
        
        return {
          caption: captionData.result,
          hashtags: extractHashtags(captionData.result),
        }
      }
    } catch (err) {
      console.error('Failed to generate caption:', err)
    }
    
    return { caption: null, hashtags: [] }
  }

  // Handle generation status updates
  useEffect(() => {
    if (!generationStatus || !pendingGenerationId) return

    if (generationStatus.status === 'COMPLETED' && generationStatus.resultUrl) {
      // Generation completed - update result
      const resultUrl = generationStatus.resultUrl
      
      if (pendingGenerationType === 'VIDEO') {
        setResult({
          video: resultUrl,
          caption: null,
          hashtags: [],
          generationId: pendingGenerationId,
        })
        
        // Generate caption if requested
        if (pendingGenerateMetadata) {
          generateCaptionAndHashtags(resultUrl, 'VIDEO', pendingPrompt).then(({ caption, hashtags }) => {
            setResult(prev => ({ ...prev, caption, hashtags }))
          })
        }
      } else if (pendingGenerationType === 'IMAGE') {
        setResult({
          image: resultUrl,
          caption: null,
          hashtags: [],
          generationId: pendingGenerationId,
        })
        
        // Generate caption if requested
        if (pendingGenerateMetadata) {
          generateCaptionAndHashtags(resultUrl, 'IMAGE', pendingPrompt).then(({ caption, hashtags }) => {
            setResult(prev => ({ ...prev, caption, hashtags }))
          })
        }
      } else if (pendingGenerationType === 'TEXT') {
        const hashtags = extractHashtags(resultUrl)
        setResult({
          image: null,
          caption: resultUrl,
          hashtags,
          generationId: pendingGenerationId,
        })
      }

      // Clear pending state and refresh generations list
      setPendingGenerationId(null)
      setPendingGenerationType(null)
      setIsGenerating(false)
      setIsModalComplete(true)
      refetchGenerations()
      
      // Clear template selection
      setPrompt('')
      setSelectedTemplate(null)
    } else if (generationStatus.status === 'FAILED') {
      // Generation failed
      setError(generationStatus.metadata?.error as string || 'Generation failed')
      setPendingGenerationId(null)
      setPendingGenerationType(null)
      setIsGenerating(false)
    }
  }, [generationStatus, pendingGenerationId, pendingGenerationType, pendingGenerateMetadata, pendingPrompt])

  const handleGenerate = async (data: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO'
    prompt: string
    textType?: 'caption' | 'script' | 'copywriting'
    imageStyle?: string
    aspectRatio?: string
    duration?: number
    referenceUrl?: string
    generateMetadata?: boolean
  }) => {
    setError(null)
    setResult({})
    setIsGenerating(true)
    setIsModalComplete(false) // Reset modal completion state
    setReferenceUrl(data.referenceUrl || null)
    setGenerationMode(data.type)

    try {
      advanceGenerationStep() // Start first step
      const responseData = await generateMutation.mutateAsync(data)
      advanceGenerationStep() // Move to next step

      // The API now returns immediately with PENDING status
      // Set pending state to trigger polling
      setPendingGenerationId(responseData.generationId)
      setPendingGenerationType(data.type)
      setPendingGenerateMetadata(data.generateMetadata ?? false)
      setPendingPrompt(data.prompt)

      // The useEffect hook will handle polling for status updates
      // and updating the result when generation completes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setIsGenerating(false)
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

  const handleDownload = () => {
    const url = result.image || result.video
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleModalComplete = () => {
    setIsModalComplete(false) // Reset completion state
  }

  return (
    <div className="space-y-10">
      {/* Generation Loading Modal */}
      <GenerationLoadingModal 
        isOpen={isGenerating} 
        mode={generationMode}
        hasReference={!!referenceUrl}
        isComplete={isModalComplete}
        onComplete={handleModalComplete}
      />

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
          <Image className="size-4" />
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
          <Video className="size-4" />
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
          <FileText className="size-4" />
          Text Mode
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Content Prompt */}
        <div className="lg:col-span-5 space-y-6">
          <ContentPromptPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
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
          {/* <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#506ced]/10 flex items-center justify-center">
                  <Zap className="size-5 text-[#506ced]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#506ced]">{credits}</div>
                  <div className="text-sm text-slate-500">Credits Available</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {mode === 'IMAGE' ? (
                    <Image className="size-5 text-slate-600 dark:text-slate-400" />
                  ) : mode === 'VIDEO' ? (
                    <Video className="size-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <FileText className="size-5 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mode === 'TEXT' ? '1' : mode === 'IMAGE' ? '5' : '20'}
                  </div>
                  <div className="text-sm text-slate-500">Credits per {mode === 'TEXT' ? 'Text' : mode === 'IMAGE' ? 'Image' : 'Video'}</div>
                </div>
              </CardContent>
            </Card>
          </div> */}
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
            isLoading={isGenerating}
            loadingMode={generationMode}
          />
        </div>
      </div>

      {/* Template Hub */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="size-5 text-[#506ced]" />
            Template Hub
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="size-5 text-[#506ced]" />
              Recent Generations
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
                    {gen.type === 'TEXT' ? (
                      <FileText className="size-8 text-slate-400" />
                    ) : gen.type === 'VIDEO' ? (
                      <Video className="size-8 text-slate-400" />
                    ) : (
                      <Image className="size-8 text-slate-400" />
                    )}
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
          <AlertTriangle className="size-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
