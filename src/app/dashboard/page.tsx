'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Generation {
  id: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  prompt: string
  resultUrl: string | null
  cost: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  isPublic: boolean
  createdAt: string
}

interface User {
  id: string
  email: string
  name?: string
  username?: string
  plan: string
}

interface DashboardData {
  user: User
  wallet: { balance: number }
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    description?: string
    createdAt: string
  }>
}

const CREDIT_COSTS = {
  TEXT: 1,
  IMAGE: 5,
  VIDEO: 20,
  UPSCALE: 3,
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT')
  const [textType, setTextType] = useState<'caption' | 'script' | 'copywriting'>('caption')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt: prompt.trim(),
          textType: type === 'TEXT' ? textType : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult(data.result || null)
      setPrompt('')
      // Refresh the page to show new generation
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Generation Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              Create AI-powered content with your credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="flex gap-2 flex-wrap">
                {(['TEXT', 'IMAGE', 'VIDEO'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={type === t ? 'default' : 'outline'}
                    onClick={() => setType(t)}
                    className="relative"
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                    <Badge variant="secondary" className="ml-2">
                      {CREDIT_COSTS[t]} credits
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Text Type Selection (only for TEXT) */}
            {type === 'TEXT' && (
              <div className="space-y-2">
                <Label>Text Style</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['caption', 'script', 'copywriting'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={textType === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTextType(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="p-4 rounded-lg bg-muted">
                <Label className="text-sm text-muted-foreground mb-2 block">Result:</Label>
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </CardContent>
        </Card>

        {/* Generation History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Library</CardTitle>
            <CardDescription>View your recent generations</CardDescription>
          </CardHeader>
          <CardContent>
            <GenerationHistory />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Plan</span>
              <Badge variant="outline" className="capitalize">Free</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Text Cost</span>
              <span>1 credit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Image Cost</span>
              <span>5 credits</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Video Cost</span>
              <span>20 credits</span>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Upgrade to Creator</CardTitle>
            <CardDescription>
              Get 300 credits/month and unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Upgrade Now - $29/mo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GenerationHistory() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch generations on mount
  useState(() => {
    fetch('/api/generations?limit=10')
      .then((res) => res.json())
      .then((data) => {
        setGenerations(data.generations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  })

  if (loading) {
    return <p className="text-muted-foreground text-center py-8">Loading...</p>
  }

  if (generations.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No generations yet. Create your first content above!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {generations.map((gen) => (
        <div
          key={gen.id}
          className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{gen.type}</Badge>
              <Badge
                variant={
                  gen.status === 'COMPLETED'
                    ? 'default'
                    : gen.status === 'FAILED'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {gen.status}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(gen.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm truncate">{gen.prompt}</p>
            {gen.resultUrl && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Result: {gen.resultUrl.substring(0, 50)}...
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">-{gen.cost} credits</span>
          </div>
        </div>
      ))}
    </div>
  )
}
