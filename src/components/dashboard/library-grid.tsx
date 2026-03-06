'use client'

import { Badge } from '@/components/ui/badge'
import { FileText, Video, Search, FolderOpen, UsersRound } from 'lucide-react'

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

interface LibraryGridProps {
  generations: Generation[]
  loading: boolean
  onSelect?: (generation: Generation) => void
}

export function LibraryGrid({ generations, loading, onSelect }: LibraryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="size-14 mx-auto mb-4 text-muted-foreground" />
        <p className="text-slate-400 font-medium">No generations yet</p>
        <p className="text-slate-500 text-sm mt-1">Create your first content to see it here</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      {generations.map((gen) => (
        <div
          key={gen.id}
          className="group relative rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={() => onSelect?.(gen)}
        >
          {/* Thumbnail */}
          <div className="aspect-square">
            {gen.type === 'IMAGE' && gen.resultUrl ? (
              <img
                src={gen.resultUrl}
                alt={gen.prompt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                {gen.type === 'TEXT' ? (
                  <FileText className="size-10 text-muted-foreground" />
                ) : gen.type === 'VIDEO' ? (
                  <Video className="size-10 text-muted-foreground" />
                ) : (
                  <Search className="size-10 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                  {gen.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`text-xs border-0 ${gen.status === 'COMPLETED'
                    ? 'bg-green-500/20 text-green-300'
                    : gen.status === 'FAILED'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                >
                  {gen.status}
                </Badge>
              </div>
              <p className="text-white text-xs truncate">{gen.prompt}</p>
            </div>
          </div>

          {gen.isPublic && (
            <div className="absolute top-4 right-4">
              <UsersRound className="size-4 text-white" />
            </div>
          )}

          {/* Status indicator */}
          {gen.status === 'PENDING' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function LibraryList({ generations, loading, onSelect }: LibraryGridProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="size-14 mx-auto mb-4 text-muted-foreground" />
        <p className="text-slate-400 font-medium">No generations yet</p>
        <p className="text-slate-500 text-sm mt-1">Create your first content to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {generations.map((gen) => (
        <div
          key={gen.id}
          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={() => onSelect?.(gen)}
        >
          {/* Thumbnail */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
            {gen.type === 'IMAGE' && gen.resultUrl ? (
              <img src={gen.resultUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {gen.type === 'TEXT' ? (
                  <FileText className="size-6 text-muted-foreground" />
                ) : gen.type === 'VIDEO' ? (
                  <Video className="size-6 text-muted-foreground" />
                ) : (
                  <Search className="size-6 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {gen.type}
              </Badge>
              <Badge
                variant={
                  gen.status === 'COMPLETED'
                    ? 'default'
                    : gen.status === 'FAILED'
                      ? 'destructive'
                      : 'secondary'
                }
                className="text-xs"
              >
                {gen.status}
              </Badge>
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(gen.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{gen.prompt}</p>
          </div>

          {/* Credits */}
          <div className="text-right flex-shrink-0 hidden sm:block">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              -{gen.cost} credits
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
