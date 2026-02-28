'use client'

import { useState, useEffect } from 'react'
import { LibraryGrid, LibraryList } from '@/components/dashboard/library-grid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Generation {
  id: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  prompt: string
  resultUrl: string | null
  cost: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  isPublic: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

export default function LibraryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [filter, setFilter] = useState<'all' | 'TEXT' | 'IMAGE' | 'VIDEO'>('all')

  useEffect(() => {
    fetchGenerations()
  }, [filter])

  const fetchGenerations = async () => {
    setLoading(true)
    try {
      const typeParam = filter !== 'all' ? `&type=${filter}` : ''
      const res = await fetch(`/api/generations?limit=50${typeParam}`)
      const data = await res.json()
      setGenerations(data.generations || [])
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generation?')) return
    
    try {
      await fetch(`/api/generations/${id}`, { method: 'DELETE' })
      setGenerations(generations.filter((g) => g.id !== id))
      setSelectedGeneration(null)
    } catch (err) {
      console.error('Failed to delete generation:', err)
    }
  }

  const handleTogglePublic = async (id: string) => {
    try {
      const res = await fetch(`/api/generations/${id}`, { method: 'PATCH' })
      const updated = await res.json()
      setGenerations(generations.map((g) => (g.id === id ? updated : g)))
    } catch (err) {
      console.error('Failed to toggle public:', err)
    }
  }

  const filteredGenerations = generations

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📁 My Library</h1>
          <p className="text-slate-500 text-sm mt-1">
            {generations.length} generations
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Type Filter */}
          <div className="flex gap-2">
            {(['all', 'TEXT', 'IMAGE', 'VIDEO'] as const).map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className={filter === type ? 'bg-primary hover:bg-primary/90' : ''}
              >
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}
            >
              ▦ Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}
            >
              ☰ List
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          {viewMode === 'grid' ? (
            <LibraryGrid
              generations={filteredGenerations}
              loading={loading}
              onSelect={setSelectedGeneration}
            />
          ) : (
            <LibraryList
              generations={filteredGenerations}
              loading={loading}
              onSelect={setSelectedGeneration}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedGeneration} onOpenChange={() => setSelectedGeneration(null)}>
        <DialogContent className="max-w-2xl">
          {selectedGeneration && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline">{selectedGeneration.type}</Badge>
                  <Badge
                    variant={
                      selectedGeneration.status === 'COMPLETED'
                        ? 'default'
                        : selectedGeneration.status === 'FAILED'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {selectedGeneration.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image Preview */}
                {selectedGeneration.type === 'IMAGE' && selectedGeneration.resultUrl && (
                  <img
                    src={selectedGeneration.resultUrl}
                    alt={selectedGeneration.prompt}
                    className="w-full rounded-lg"
                  />
                )}

                {/* Text Result */}
                {selectedGeneration.type === 'TEXT' && selectedGeneration.resultUrl && (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border">
                    <p className="whitespace-pre-wrap text-sm">{selectedGeneration.resultUrl}</p>
                  </div>
                )}

                {/* Prompt */}
                <div>
                  <label className="text-sm font-medium text-slate-500">Prompt</label>
                  <p className="text-sm mt-1">{selectedGeneration.prompt}</p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Cost: {selectedGeneration.cost} credits</span>
                  <span>Date: {new Date(selectedGeneration.createdAt).toLocaleDateString()}</span>
                  <span>Public: {selectedGeneration.isPublic ? 'Yes' : 'No'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublic(selectedGeneration.id)}
                  >
                    {selectedGeneration.isPublic ? 'Make Private' : 'Make Public'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedGeneration.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
