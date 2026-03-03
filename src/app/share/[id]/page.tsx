'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileText, ImageIcon, Video, Search, Sparkles, Lightbulb, Download, Link2, Copy, Check, Loader2, Frown } from 'lucide-react'
import Link from 'next/link'

interface SharedGeneration {
  id: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  prompt: string
  resultUrl: string | null
  cost: number
  status: string
  createdAt: string
  user: {
    name: string | null
    image: string | null
  }
}

const TYPE_CONFIG = {
  TEXT: { icon: FileText, label: 'Text', color: 'bg-blue-500' },
  IMAGE: { icon: ImageIcon, label: 'Image', color: 'bg-purple-500' },
  VIDEO: { icon: Video, label: 'Video', color: 'bg-pink-500' },
  UPSCALE: { icon: Search, label: 'Upscale', color: 'bg-green-500' },
}

export default function SharePage() {
  const params = useParams()
  const shareId = params.id as string

  const [generation, setGeneration] = useState<SharedGeneration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchSharedContent()
  }, [shareId])

  const fetchSharedContent = async () => {
    try {
      const res = await fetch(`/api/share/${shareId}`)
      if (!res.ok) throw new Error('Content not found')
      const data = await res.json()
      setGeneration(data)
    } catch (err) {
      setError('Content not found or has been removed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (generation?.resultUrl) {
      window.open(generation.resultUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111421] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-10 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-slate-500">Loading shared content...</p>
        </div>
      </div>
    )
  }

  if (error || !generation) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111421] flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Frown className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Content Not Found
            </h1>
            <p className="text-slate-500 mb-6">
              {error || 'This shared content may have been removed or expired.'}
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const typeConfig = TYPE_CONFIG[generation.type]

  return (
    <div className="min-h-screen w-full bg-[#f6f6f8] dark:bg-[#111421]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111421]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Sparkles className="size-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BuatinAi</h1>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90">
              Create Your Own
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar>
            <AvatarImage src={generation.user.image || ''} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {generation.user.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {generation.user.name || 'Anonymous'}
            </p>
            <p className="text-xs text-slate-500">
              Shared on {new Date(generation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={`ml-auto ${typeConfig.color} text-white`}>
            <typeConfig.icon className="size-3 mr-1" /> {typeConfig.label}
          </Badge>
        </div>

        {/* Content Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0">
            {/* Result Display */}
            {generation.type === 'IMAGE' && generation.resultUrl && (
              <div className="relative">
                <img
                  src={generation.resultUrl}
                  alt={generation.prompt}
                  className="w-full max-h-[70vh] object-contain bg-slate-100 dark:bg-slate-800"
                />
                {/* Hover Actions */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button
                    onClick={handleDownload}
                    className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                  >
                    <Download className="size-4 mr-1" /> Download
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="bg-white/90 backdrop-blur"
                  >
                    {copied ? <><Check className="size-4 mr-1" /> Copied!</> : <><Link2 className="size-4 mr-1" /> Copy Link</>}
                  </Button>
                </div>
              </div>
            )}

            {generation.type === 'VIDEO' && generation.resultUrl && (
              <div className="relative">
                <video
                  src={generation.resultUrl}
                  controls
                  className="w-full max-h-[70vh] bg-black"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="bg-white/90 backdrop-blur"
                  >
                    {copied ? <><Check className="size-4 mr-1" /> Copied!</> : <><Link2 className="size-4 mr-1" /> Copy Link</>}
                  </Button>
                </div>
              </div>
            )}

            {generation.type === 'TEXT' && generation.resultUrl && (
              <div className="p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {generation.resultUrl}
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generation.resultUrl || '')
                    }}
                    variant="outline"
                  >
                    <Copy className="size-4 mr-1" /> Copy Text
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                  >
                    {copied ? <><Check className="size-4 mr-1" /> Copied!</> : <><Link2 className="size-4 mr-1" /> Copy Link</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prompt Info */}
        <Card className="mt-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" /> Prompt Used
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {generation.prompt}
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 mb-4">
            Create your own AI-generated content with BuatinAi
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Sparkles className="size-4 mr-2" /> Get Started Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
