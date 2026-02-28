'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ResultDisplayProps {
  image?: string | null
  video?: string | null
  caption?: string | null
  hashtags?: string[]
  generationId?: string
  onDownload?: () => void
  onCopyCaption?: () => void
  onCopyHashtags?: () => void
}

export function ResultDisplay({
  image,
  video,
  caption,
  hashtags = [],
  generationId,
  onDownload,
  onCopyCaption,
  onCopyHashtags,
}: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<'result' | 'caption' | 'hashtags'>('result')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const hasContent = image || video || caption

  const handleShare = async () => {
    if (generationId) {
      const url = `${window.location.origin}/share/${generationId}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      setCopied('share')
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleCopy = async (type: 'caption' | 'hashtags') => {
    if (type === 'caption' && caption) {
      await navigator.clipboard.writeText(caption)
    } else if (type === 'hashtags' && hashtags.length > 0) {
      await navigator.clipboard.writeText(hashtags.map(t => `#${t}`).join(' '))
    }
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g) || []
    return matches.map(tag => tag.replace('#', ''))
  }

  // Extract hashtags from caption if not provided
  const displayHashtags = hashtags.length > 0 ? hashtags : (caption ? extractHashtags(caption) : [])

  return (
    <>
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'result'
                ? 'border-b-2 border-[#506ced] text-[#506ced] bg-[#506ced]/5'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('result')}
          >
            <span>🖼️</span>
            Result
          </button>
          <button
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'caption'
                ? 'border-b-2 border-[#506ced] text-[#506ced] bg-[#506ced]/5'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('caption')}
          >
            <span>📝</span>
            Caption
          </button>
          <button
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'hashtags'
                ? 'border-b-2 border-[#506ced] text-[#506ced] bg-[#506ced]/5'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('hashtags')}
          >
            <span>#️⃣</span>
            Hashtags
          </button>
        </div>

        <CardContent className="p-6 flex-1 flex flex-col overflow-auto">
          {/* Result Tab */}
          {activeTab === 'result' && (
            <>
              {image ? (
                <div className="relative group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 mb-4 min-h-[300px]">
                  <img
                    src={image}
                    alt="Generated content"
                    className="max-w-full max-h-[400px] object-contain cursor-pointer"
                    onClick={() => setPreviewOpen(true)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewOpen(true)}
                      className="bg-white text-slate-900 font-bold"
                    >
                      <span className="mr-1">👁️</span>
                      Preview
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onDownload}
                      className="bg-white text-slate-900 font-bold"
                    >
                      <span className="mr-1">📥</span>
                      Download
                    </Button>
                    {generationId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleShare}
                        className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                      >
                        <span className="mr-1">🔗</span>
                        {copied === 'share' ? 'Copied!' : 'Share'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : video ? (
                <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 dark:border-slate-800 mb-4 min-h-[300px]">
                  <video
                    src={video}
                    controls
                    className="max-w-full max-h-[400px]"
                  />
                  {generationId && (
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleShare}
                        className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                      >
                        <span className="mr-1">🔗</span>
                        {copied === 'share' ? 'Copied!' : 'Share'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  <div className="text-center text-slate-400">
                    <span className="text-4xl mb-2 block">🖼️</span>
                    <p className="text-sm">Generated content will appear here</p>
                  </div>
                </div>
              )}

              {/* Quick Caption Preview */}
              {caption && (
                <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Generated Caption Preview:</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{caption}</p>
                </div>
              )}
            </>
          )}

          {/* Caption Tab */}
          {activeTab === 'caption' && (
            <div className="flex-1 flex flex-col">
              {caption ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-[#506ced]">📝</span>
                      AI Generated Caption
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy('caption')}
                      className="text-xs font-bold text-[#506ced] hover:underline"
                    >
                      {copied === 'caption' ? '✓ Copied!' : '📋 Copy'}
                    </Button>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap overflow-auto">
                    {caption}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">📝</span>
                    <p className="text-sm">Caption will appear here after generation</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hashtags Tab */}
          {activeTab === 'hashtags' && (
            <div className="flex-1 flex flex-col">
              {displayHashtags.length > 0 ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-[#506ced]">#️⃣</span>
                      Hashtags ({displayHashtags.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy('hashtags')}
                      className="text-xs font-bold text-[#506ced] hover:underline"
                    >
                      {copied === 'hashtags' ? '✓ Copied!' : '📋 Copy All'}
                    </Button>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {displayHashtags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-[#506ced]/10 text-[#506ced] border-[#506ced]/20 hover:bg-[#506ced]/20 cursor-pointer"
                          onClick={() => navigator.clipboard.writeText(`#${tag}`)}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">#️⃣</span>
                    <p className="text-sm">Hashtags will appear here after generation</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Full Preview</DialogTitle>
          </DialogHeader>
          {image && (
            <div className="relative bg-black flex items-center justify-center">
              <img
                src={image}
                alt="Full preview"
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button
                  onClick={onDownload}
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  📥 Download
                </Button>
                {generationId && (
                  <Button
                    onClick={handleShare}
                    variant="secondary"
                    className="bg-white/90"
                  >
                    🔗 {copied === 'share' ? 'Copied!' : 'Share'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
