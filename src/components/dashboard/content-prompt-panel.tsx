'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Template } from '@/hooks/use-queries'

interface ContentPromptPanelProps {
  onGenerate: (data: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO'
    prompt: string
    textType?: 'caption' | 'script' | 'copywriting'
    imageStyle?: string
    aspectRatio?: string
    duration?: number
    referenceUrl?: string
  }) => Promise<void>
  isGenerating: boolean
  credits: number
  mode?: 'TEXT' | 'IMAGE' | 'VIDEO'
  selectedTemplate?: Template | null
  prompt?: string
  onPromptChange?: (prompt: string) => void
  onClearTemplate?: () => void
}

const TEXT_TYPES = [
  { value: 'caption', label: 'Caption', icon: '✍️' },
  { value: 'script', label: 'Script', icon: '🎬' },
  { value: 'copywriting', label: 'Copywriting', icon: '📝' },
] as const

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
] as const

const IMAGE_STYLES = [
  'Cinematic', 'Anime', 'Realistic', 'Oil Painting', 
  'Watercolor', 'Digital Art', '3D Render', 'Minimalist'
]

const VIDEO_DURATIONS = [
  { value: 3, label: '3 seconds' },
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
]

const CREDIT_COSTS = {
  TEXT: 1,
  IMAGE: 5,
  VIDEO: 20,
}

export function ContentPromptPanel({ 
  onGenerate, 
  isGenerating, 
  credits,
  mode: externalMode,
  selectedTemplate,
  prompt: externalPrompt,
  onPromptChange,
  onClearTemplate
}: ContentPromptPanelProps) {
  const [internalMode, setInternalMode] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('IMAGE')
  const [internalPrompt, setInternalPrompt] = useState('')
  const [textType, setTextType] = useState<'caption' | 'script' | 'copywriting'>('caption')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [imageStyle, setImageStyle] = useState('')
  const [duration, setDuration] = useState(5)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use external values if provided, otherwise use internal state
  const mode = externalMode ?? internalMode
  const prompt = externalPrompt ?? internalPrompt
  const setPrompt = onPromptChange ?? setInternalPrompt
  const setMode = externalMode !== undefined ? () => {} : setInternalMode

  // Sync mode when template is selected
  useEffect(() => {
    if (selectedTemplate && externalMode === undefined) {
      setInternalMode(selectedTemplate.type as 'TEXT' | 'IMAGE' | 'VIDEO')
    }
  }, [selectedTemplate, externalMode])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setReferencePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearReference = () => {
    setReferenceFile(null)
    setReferencePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    await onGenerate({
      type: mode,
      prompt: prompt.trim(),
      textType: mode === 'TEXT' ? textType : undefined,
      imageStyle: mode === 'IMAGE' ? imageStyle : undefined,
      aspectRatio: mode === 'IMAGE' || mode === 'VIDEO' ? aspectRatio : undefined,
      duration: mode === 'VIDEO' ? duration : undefined,
      referenceUrl: referencePreview || undefined,
    })
  }

  const creditCost = CREDIT_COSTS[mode]

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="text-[#506ced]">✏️</span>
            Content Prompt
          </CardTitle>
          {/* Selected Template Badge */}
          {selectedTemplate && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#506ced]/10 text-[#506ced] border-[#506ced]/20">
                📋 {selectedTemplate.name}
              </Badge>
              {onClearTemplate && (
                <button
                  onClick={onClearTemplate}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle - only show if external mode not provided */}
        {externalMode === undefined && (
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'IMAGE'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setInternalMode('IMAGE')}
            >
              <span>🖼️</span>
              Photo
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'VIDEO'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setInternalMode('VIDEO')}
            >
              <span>🎬</span>
              Video
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'TEXT'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setInternalMode('TEXT')}
            >
              <span>📝</span>
              Text
            </button>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={
              mode === 'IMAGE'
                ? "Describe the image you want to create... e.g. A futuristic workspace with soft neon lighting."
                : mode === 'VIDEO'
                ? "Describe the video scene you want... e.g. A sunset over mountains with birds flying."
                : "Describe what you want to create... e.g. A motivational caption about success."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
          />
        </div>

        {/* Reference Image/Video Upload - for IMAGE and VIDEO modes */}
        {(mode === 'IMAGE' || mode === 'VIDEO') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reference {mode === 'IMAGE' ? 'Image' : 'Video'} (Optional)
            </Label>
            {referencePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {mode === 'IMAGE' ? (
                  <img src={referencePreview} alt="Reference" className="w-full h-40 object-cover" />
                ) : (
                  <video src={referencePreview} className="w-full h-40 object-cover" />
                )}
                <button
                  onClick={clearReference}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#506ced]/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-500 dark:text-slate-400">
                  <span className="text-2xl">📁</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Click or drag to upload reference
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'IMAGE' ? 'PNG, JPG up to 10MB' : 'MP4, MOV up to 50MB'}
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === 'IMAGE' ? 'image/*' : 'video/*'}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Text Options */}
        {mode === 'TEXT' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Text Style
            </Label>
            <div className="flex gap-2 flex-wrap">
              {TEXT_TYPES.map((t) => (
                <Button
                  key={t.value}
                  variant={textType === t.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTextType(t.value)}
                  className={textType === t.value ? 'bg-[#506ced] hover:bg-[#506ced]/90' : ''}
                >
                  <span className="mr-1">{t.icon}</span>
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Image Options */}
        {mode === 'IMAGE' && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Style
              </Label>
              <div className="flex gap-2 flex-wrap">
                {IMAGE_STYLES.map((s) => (
                  <Button
                    key={s}
                    variant={imageStyle === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageStyle(imageStyle === s ? '' : s)}
                    className={imageStyle === s ? 'bg-[#506ced] hover:bg-[#506ced]/90' : ''}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Aspect Ratio
              </Label>
              <div className="flex gap-2 flex-wrap">
                {ASPECT_RATIOS.map((ar) => (
                  <Button
                    key={ar.value}
                    variant={aspectRatio === ar.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAspectRatio(ar.value)}
                    className={aspectRatio === ar.value ? 'bg-[#506ced] hover:bg-[#506ced]/90' : ''}
                  >
                    {ar.value}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Video Options */}
        {mode === 'VIDEO' && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration
              </Label>
              <div className="flex gap-2 flex-wrap">
                {VIDEO_DURATIONS.map((d) => (
                  <Button
                    key={d.value}
                    variant={duration === d.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(d.value)}
                    className={duration === d.value ? 'bg-[#506ced] hover:bg-[#506ced]/90' : ''}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Aspect Ratio
              </Label>
              <div className="flex gap-2 flex-wrap">
                {ASPECT_RATIOS.map((ar) => (
                  <Button
                    key={ar.value}
                    variant={aspectRatio === ar.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAspectRatio(ar.value)}
                    className={aspectRatio === ar.value ? 'bg-[#506ced] hover:bg-[#506ced]/90' : ''}
                  >
                    {ar.value}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Generate Button */}
        <div className="space-y-4 pt-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || credits < creditCost}
            className="w-full bg-[#506ced] hover:bg-[#506ced]/90 text-white font-bold py-3.5 shadow-lg shadow-[#506ced]/20 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate {mode === 'TEXT' ? 'Text' : mode === 'IMAGE' ? 'Image' : 'Video'}
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <span>ℹ️</span>
            {credits >= creditCost ? (
              <span>{creditCost} credits will be used</span>
            ) : (
              <span className="text-red-500">Not enough credits (need {creditCost})</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
