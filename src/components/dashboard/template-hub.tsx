'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTemplates, useTemplateUsage, type Template } from '@/hooks/use-queries'

interface TemplateHubProps {
  onSelectTemplate: (template: Template) => void
  templates?: Template[]
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '🌟' },
  { value: 'TRENDING_MEME', label: 'Trending', icon: '🔥' },
  { value: 'RAMADHAN', label: 'Ramadhan', icon: '🌙' },
  { value: 'CHINESE_NEW_YEAR', label: 'CNY', icon: '🧧' },
  { value: 'BUSINESS', label: 'Business', icon: '💼' },
  { value: 'SOCIAL_MEDIA', label: 'Social', icon: '📱' },
  { value: 'MARKETING', label: 'Marketing', icon: '📈' },
] as const

export function TemplateHub({ onSelectTemplate, templates: externalTemplates }: TemplateHubProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  
  // Use TanStack Query only if external templates not provided
  const { data, isLoading, isFetching } = useTemplates(
    externalTemplates ? undefined : { category: activeCategory, limit: 12 }
  )
  
  const templateUsage = useTemplateUsage()
  
  // Use external templates if provided, otherwise use query data
  const templates = externalTemplates ?? data?.templates ?? []
  const loading = externalTemplates ? false : isLoading || isFetching

  // Filter by category if external templates provided
  const filteredTemplates: Template[] = externalTemplates && activeCategory !== 'all'
    ? templates.filter((t: Template) => t.category === activeCategory)
    : templates

  const handleSelectTemplate = async (template: Template) => {
    // Increment usage count
    templateUsage.mutate(template.id)
    onSelectTemplate(template)
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.value)}
            className={activeCategory === cat.value ? 'bg-[#506ced] hover:bg-[#506ced]/90' : 'flex-shrink-0'}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Loading Overlay for filter changes */}
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center rounded-xl">
          <div className="animate-spin text-2xl">⏳</div>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">📝</span>
          <p className="text-slate-400">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template: Template) => (
            <Card
              key={template.id}
              className="group cursor-pointer hover:ring-2 hover:ring-[#506ced]/50 transition-all overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              onClick={() => handleSelectTemplate(template)}
            >
              {/* Thumbnail */}
              <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-[#506ced]/10 to-pink-500/10">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-50">
                      {template.type === 'TEXT' ? '📝' : template.type === 'IMAGE' ? '🖼️' : '🎬'}
                    </span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#506ced]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Use Template</span>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs bg-[#506ced]/10 text-[#506ced] border-0">
                    {template.type}
                  </Badge>
                  <span className="text-xs text-slate-400 ml-auto">
                    {template.usageCount} uses
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {template.name}
                </h4>
                {template.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                )}
                {template.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {template.tags.slice(0, 2).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
