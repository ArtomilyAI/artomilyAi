'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useTemplates, useTemplateUsage, type Template } from '@/hooks/use-queries'

const CATEGORIES = [
  { value: 'all', label: 'All Templates', icon: '🌟' },
  { value: 'TRENDING_MEME', label: 'Trending Memes', icon: '🔥' },
  { value: 'VIRAL_TEMPLATE', label: 'Viral Templates', icon: '📱' },
  { value: 'RAMADHAN', label: 'Ramadhan', icon: '🌙' },
  { value: 'CHINESE_NEW_YEAR', label: 'Chinese New Year', icon: '🧧' },
  { value: 'NATIONAL_DAY', label: 'National Day', icon: '🇮🇩' },
  { value: 'BUSINESS', label: 'Business', icon: '💼' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: '📲' },
  { value: 'MARKETING', label: 'Marketing', icon: '📈' },
] as const

export default function TemplatesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')

  // TanStack Query hooks with debounced search
  const { data, isLoading, isFetching } = useTemplates({
    category: activeCategory,
    search: searchQuery || undefined,
    limit: 50,
  })
  
  const templateUsage = useTemplateUsage()

  const templates = data?.templates ?? []
  const loading = isLoading || isFetching

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setCustomPrompt(template.prompt)
  }

  const handleUseTemplate = () => {
    if (!selectedTemplate) return

    // Increment usage
    templateUsage.mutate(selectedTemplate.id)

    // Store the template data in sessionStorage and redirect to dashboard
    sessionStorage.setItem('selectedTemplate', JSON.stringify({
      ...selectedTemplate,
      prompt: customPrompt,
    }))
    router.push('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🎨 Template Hub</h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose from pre-made templates to generate content faster
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white dark:bg-slate-900"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.value)}
            className={activeCategory === cat.value ? 'bg-[#506ced] hover:bg-[#506ced]/90' : ''}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Loading indicator for filter changes */}
      {isFetching && !isLoading && (
        <div className="text-center py-4">
          <span className="text-slate-400">Updating...</span>
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
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">📝</span>
          <p className="text-slate-400 font-medium">No templates found</p>
          <p className="text-slate-500 text-sm mt-1">Try a different category or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((template: Template) => (
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

                {/* Overlay */}
                <div className="absolute inset-0 bg-[#506ced]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Use Template</span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 text-slate-900 text-xs">
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#506ced]/10 text-[#506ced] border-0"
                  >
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
                    {template.tags.slice(0, 3).map((tag: string, i: number) => (
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

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTemplate.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Thumbnail Preview */}
                {selectedTemplate.thumbnail && (
                  <img
                    src={selectedTemplate.thumbnail}
                    alt={selectedTemplate.name}
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                )}

                {/* Description */}
                {selectedTemplate.description && (
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedTemplate.description}
                  </p>
                )}

                {/* Editable Prompt */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Prompt Template
                  </label>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Use {'{variable}'} syntax for customizable parts
                  </p>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  {selectedTemplate.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#506ced] hover:bg-[#506ced]/90"
                    onClick={handleUseTemplate}
                    disabled={templateUsage.isPending}
                  >
                    <span className="mr-2">✨</span>
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Cancel
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
