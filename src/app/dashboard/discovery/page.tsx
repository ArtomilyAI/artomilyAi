'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDiscovery,
  type DiscoveryGeneration,
} from '@/hooks/use-queries'
import {
  Compass,
  FileText,
  Video,
  Search,
  Link2,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 20

export default function DiscoveryPage() {
  const [filter, setFilter] = useState<'all' | 'TEXT' | 'IMAGE' | 'VIDEO'>('all')
  const [page, setPage] = useState(0)
  const [selectedGeneration, setSelectedGeneration] = useState<DiscoveryGeneration | null>(null)
  const [copied, setCopied] = useState(false)

  const { data, isLoading, isFetching } = useDiscovery({
    type: filter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })

  const generations = data?.generations ?? []
  const total = data?.total ?? 0
  const hasMore = data?.hasMore ?? false
  const loading = isLoading

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/share/${id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="size-5 sm:size-6 text-primary" /> Discovery
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore {total > 0 ? `${total} ` : ''}public creations from the community
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'TEXT', 'IMAGE', 'VIDEO'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(type)
                setPage(0)
              }}
              className={filter === type ? 'bg-primary hover:bg-primary/90' : ''}
            >
              {type === 'all' ? 'All' : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading indicator for filter/page changes */}
      {isFetching && !isLoading && (
        <div className="text-center py-4">
          <span className="text-slate-400">Updating...</span>
        </div>
      )}

      {/* Content Grid */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-lg sm:rounded-xl" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-16">
              <Compass className="size-14 mx-auto mb-4 text-muted-foreground" />
              <p className="text-slate-400 font-medium">No public content yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Be the first to share your creations with the community
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="group relative rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => setSelectedGeneration(gen)}
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
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
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

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                          {gen.type}
                        </Badge>
                      </div>
                      <p className="text-white text-xs truncate">{gen.prompt}</p>
                    </div>
                  </div>

                  {/* Creator Avatar */}
                  <div className="absolute top-2 left-2">
                    <Avatar className="size-7 border-2 border-white dark:border-slate-800 shadow-sm">
                      <AvatarImage src={gen.user.image || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {gen.user.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedGeneration} onOpenChange={() => setSelectedGeneration(null)}>
        <DialogContent className="max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
          {selectedGeneration && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{selectedGeneration.type}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Creator Info */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedGeneration.user.image || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedGeneration.user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {selectedGeneration.user.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(selectedGeneration.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {selectedGeneration.type === 'IMAGE' && selectedGeneration.resultUrl && (
                  <img
                    src={selectedGeneration.resultUrl}
                    alt={selectedGeneration.prompt}
                    className="w-full max-h-[40vh] object-contain rounded-lg bg-slate-100 dark:bg-slate-800"
                  />
                )}

                {/* Video Preview */}
                {selectedGeneration.type === 'VIDEO' && selectedGeneration.resultUrl && (
                  <video
                    src={selectedGeneration.resultUrl}
                    controls
                    className="w-full max-h-[40vh] rounded-lg"
                  />
                )}

                {/* Text Result */}
                {selectedGeneration.type === 'TEXT' && selectedGeneration.resultUrl && (
                  <div className="p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border max-h-[30vh] overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedGeneration.resultUrl}
                    </p>
                  </div>
                )}

                {/* Prompt */}
                <div>
                  <label className="text-sm font-medium text-slate-500">Prompt</label>
                  <p className="text-sm mt-1 wrap-break-word">{selectedGeneration.prompt}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(selectedGeneration.id)}
                    className="w-full sm:w-auto"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 mr-1" /> Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="size-4 mr-1" /> Copy Link
                      </>
                    )}
                  </Button>
                  {selectedGeneration.resultUrl &&
                    selectedGeneration.type !== 'TEXT' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(selectedGeneration.resultUrl!)
                        }
                        className="w-full sm:w-auto"
                      >
                        <Download className="size-4 mr-1" /> Download
                      </Button>
                    )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
