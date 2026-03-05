'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  useTemplates,
  useTemplateUsage,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  type Template,
  type CreateTemplateInput,
} from '@/hooks/use-queries'
import {
  Star,
  Flame,
  Smartphone,
  Moon,
  Gift,
  Flag,
  Briefcase,
  Share2,
  TrendingUp,
  Sparkles,
  FileText,
  ImageIcon,
  Video,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'all', label: 'All Templates', icon: <Star className="size-4" /> },
  { value: 'TRENDING_MEME', label: 'Trending Memes', icon: <Flame className="size-4" /> },
  { value: 'VIRAL_TEMPLATE', label: 'Viral Templates', icon: <Smartphone className="size-4" /> },
  { value: 'RAMADHAN', label: 'Ramadhan', icon: <Moon className="size-4" /> },
  { value: 'CHINESE_NEW_YEAR', label: 'Chinese New Year', icon: <Gift className="size-4" /> },
  { value: 'NATIONAL_DAY', label: 'National Day', icon: <Flag className="size-4" /> },
  { value: 'BUSINESS', label: 'Business', icon: <Briefcase className="size-4" /> },
  { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: <Share2 className="size-4" /> },
  { value: 'MARKETING', label: 'Marketing', icon: <TrendingUp className="size-4" /> },
] as const

export default function TemplatesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')

  // Admin: add/edit template dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<CreateTemplateInput>>({
    name: '',
    description: '',
    prompt: '',
    type: 'IMAGE',
    category: 'TRENDING_MEME',
    tags: [],
    thumbnail: '',
    isPublic: true,
  })
  const [tagsInput, setTagsInput] = useState('')
  const [addError, setAddError] = useState('')

  // TanStack Query hooks with debounced search
  const { data, isLoading, isFetching } = useTemplates({
    category: activeCategory,
    search: searchQuery || undefined,
    limit: 50,
  })

  const templateUsage = useTemplateUsage()
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()

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

  const handleAddTemplate = async () => {
    setAddError('')
    if (!newTemplate.name || !newTemplate.prompt || !newTemplate.type || !newTemplate.category) {
      setAddError('Name, prompt, type, and category are required.')
      return
    }

    const tags = tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : []

    try {
      if (editingTemplate) {
        // Update existing template
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          ...newTemplate,
          name: newTemplate.name!,
          prompt: newTemplate.prompt!,
          type: newTemplate.type as CreateTemplateInput['type'],
          category: newTemplate.category as CreateTemplateInput['category'],
          tags,
          thumbnail: newTemplate.thumbnail || undefined,
        })
      } else {
        // Create new template
        await createTemplate.mutateAsync({
          ...newTemplate,
          name: newTemplate.name!,
          prompt: newTemplate.prompt!,
          type: newTemplate.type as CreateTemplateInput['type'],
          category: newTemplate.category as CreateTemplateInput['category'],
          tags,
          thumbnail: newTemplate.thumbnail || undefined,
        })
      }
      closeAddDialog()
    } catch (err: any) {
      setAddError(err.message || 'Failed to save template')
    }
  }

  const handleEditTemplate = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTemplate(template)
    setNewTemplate({
      name: template.name,
      description: template.description ?? '',
      prompt: template.prompt,
      type: template.type,
      category: template.category as CreateTemplateInput['category'],
      thumbnail: template.thumbnail ?? '',
      isPublic: template.isPublic ?? true,
    })
    setTagsInput(template.tags.join(', '))
    setAddError('')
    setAddDialogOpen(true)
  }

  const handleDeleteTemplate = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete template "${template.name}"? This cannot be undone.`)) return
    try {
      await deleteTemplate.mutateAsync(template.id)
    } catch (err: any) {
      alert(err.message || 'Failed to delete template')
    }
  }

  const handleToggleVisibility = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        isPublic: !template.isPublic,
      })
    } catch (err: any) {
      alert(err.message || 'Failed to update visibility')
    }
  }

  const closeAddDialog = () => {
    setAddDialogOpen(false)
    setEditingTemplate(null)
    setNewTemplate({
      name: '',
      description: '',
      prompt: '',
      type: 'IMAGE',
      category: 'TRENDING_MEME',
      thumbnail: '',
      isPublic: true,
    })
    setTagsInput('')
    setAddError('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="size-6 text-primary" /> Template Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Choose from pre-made templates to generate content faster
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-primary hover:bg-primary/90 shrink-0"
            onClick={() => { setEditingTemplate(null); setAddDialogOpen(true) }}
          >
            <Plus className="mr-2 size-4" />
            Add Template
          </Button>
        )}
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
            className={activeCategory === cat.value ? 'bg-primary hover:bg-primary/90' : ''}
          >
            <span className="mr-2">{cat.icon}</span>
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
              className="aspect-4/5 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="size-14 mx-auto mb-4 text-muted-foreground" />
          <p className="text-slate-400 font-medium">No templates found</p>
          <p className="text-slate-500 text-sm mt-1">Try a different category or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((template: Template) => (
            <Card
              key={template.id}
              className="group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              onClick={() => handleSelectTemplate(template)}
            >
              {/* Thumbnail */}
              <div className="aspect-4/5 relative overflow-hidden bg-linear-to-br from-primary/10 to-pink-500/10">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {template.type === 'TEXT' ? (
                      <FileText className="size-12 text-muted-foreground/50" />
                    ) : template.type === 'IMAGE' ? (
                      <ImageIcon className="size-12 text-muted-foreground/50" />
                    ) : (
                      <Video className="size-12 text-muted-foreground/50" />
                    )}
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Use Template</span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 text-slate-900 text-xs">
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Private badge */}
                {isAdmin && !template.isPublic && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-slate-800/90 text-white text-xs gap-1">
                      <EyeOff className="size-3" /> Private
                    </Badge>
                  </div>
                )}

                {/* Admin actions (top-right) */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleVisibility(template, e)}
                      className="p-1.5 rounded-md bg-white/90 hover:bg-white text-slate-700 shadow-sm"
                      title={template.isPublic ? 'Make private' : 'Make public'}
                    >
                      {template.isPublic ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleEditTemplate(template, e)}
                      className="p-1.5 rounded-md bg-white/90 hover:bg-white text-slate-700 shadow-sm"
                      title="Edit template"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTemplate(template, e)}
                      className="p-1.5 rounded-md bg-white/90 hover:bg-red-100 text-red-600 shadow-sm"
                      title="Delete template"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-0"
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
        <DialogContent className="max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{selectedTemplate.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Thumbnail Preview */}
                {selectedTemplate.thumbnail && (
                  <img
                    src={selectedTemplate.thumbnail}
                    alt={selectedTemplate.name}
                    className="w-full max-h-40 sm:max-h-48 object-cover rounded-lg"
                  />
                )}

                {/* Description */}
                {selectedTemplate.description && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
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
                    className="mt-2 min-h-25 sm:min-h-30"
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleUseTemplate}
                    disabled={templateUsage.isPending}
                  >
                    <Sparkles className="mr-2 size-4" />
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

      {/* Admin – Add Template Dialog */}
      {isAdmin && (
        <Dialog open={addDialogOpen} onOpenChange={(open) => { if (!open) closeAddDialog() }}>
          <DialogContent className="max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Add New Template'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {addError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md px-3 py-2">
                  {addError}
                </p>
              )}

              {/* Name */}
              <div className="grid gap-1.5">
                <Label htmlFor="tpl-name">Name *</Label>
                <Input
                  id="tpl-name"
                  placeholder="Template name"
                  value={newTemplate.name ?? ''}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="grid gap-1.5">
                <Label htmlFor="tpl-desc">Description</Label>
                <Input
                  id="tpl-desc"
                  placeholder="Short description"
                  value={newTemplate.description ?? ''}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Prompt */}
              <div className="grid gap-1.5">
                <Label htmlFor="tpl-prompt">Prompt *</Label>
                <Textarea
                  id="tpl-prompt"
                  placeholder="Write the prompt template here..."
                  value={newTemplate.prompt ?? ''}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, prompt: e.target.value }))}
                  className="min-h-25"
                />
                <p className="text-xs text-slate-400">Use {'{variable}'} syntax for customizable parts</p>
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="tpl-type">Type *</Label>
                  <select
                    id="tpl-type"
                    className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
                    value={newTemplate.type ?? 'IMAGE'}
                    onChange={(e) =>
                      setNewTemplate((p) => ({ ...p, type: e.target.value as CreateTemplateInput['type'] }))
                    }
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="UPSCALE">UPSCALE</option>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="tpl-cat">Category *</Label>
                  <select
                    id="tpl-cat"
                    className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
                    value={newTemplate.category ?? 'TRENDING_MEME'}
                    onChange={(e) =>
                      setNewTemplate((p) => ({
                        ...p,
                        category: e.target.value as CreateTemplateInput['category'],
                      }))
                    }
                  >
                    <option value="RAMADHAN">Ramadhan</option>
                    <option value="CHINESE_NEW_YEAR">Chinese New Year</option>
                    <option value="NATIONAL_DAY">National Day</option>
                    <option value="TRENDING_MEME">Trending Meme</option>
                    <option value="VIRAL_TEMPLATE">Viral Template</option>
                    <option value="BUSINESS">Business</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="grid gap-1.5">
                <Label htmlFor="tpl-tags">Tags (comma-separated)</Label>
                <Input
                  id="tpl-tags"
                  placeholder="e.g. funny, meme, viral"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              {/* Thumbnail */}
              <div className="grid gap-1.5">
                <Label htmlFor="tpl-thumb">Thumbnail URL</Label>
                <Input
                  id="tpl-thumb"
                  placeholder="https://..."
                  value={newTemplate.thumbnail ?? ''}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, thumbnail: e.target.value }))}
                />
              </div>

              {/* isPublic toggle */}
              <div className="flex items-center gap-2">
                <input
                  id="tpl-public"
                  type="checkbox"
                  className="accent-primary size-4"
                  checked={newTemplate.isPublic ?? true}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, isPublic: e.target.checked }))}
                />
                <Label htmlFor="tpl-public" className="cursor-pointer">
                  Make public
                </Label>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleAddTemplate}
                  disabled={createTemplate.isPending || updateTemplate.isPending}
                >
                  {(createTemplate.isPending || updateTemplate.isPending)
                    ? 'Saving...'
                    : editingTemplate
                      ? 'Save Changes'
                      : 'Save Template'}
                </Button>
                <Button variant="outline" onClick={closeAddDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
