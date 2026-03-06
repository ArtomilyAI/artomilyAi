import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Template {
  id: string
  name: string
  description: string | null
  prompt: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  category: string
  tags: string[]
  thumbnail: string | null
  isPublic: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface Generation {
  id: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  prompt: string
  resultUrl: string | null
  cost: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  isPublic: boolean
  createdAt: string
}

export interface UserWallet {
  balance: number
}

// Discovery generation extends Generation with user info
export interface DiscoveryGeneration extends Generation {
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

// Query Keys - centralized for easy invalidation
export const queryKeys = {
  templates: (filters?: { category?: string; type?: string; search?: string; limit?: number }) =>
    ['templates', filters] as const,
  template: (id: string) => ['template', id] as const,
  generations: (filters?: { type?: string; limit?: number }) => ['generations', filters] as const,
  generation: (id: string) => ['generation', id] as const,
  generationStatus: (id: string) => ['generation', id, 'status'] as const,
  userWallet: () => ['user', 'wallet'] as const,
  discovery: (filters?: { type?: string; limit?: number; offset?: number }) =>
    ['discovery', filters] as const,
}

// Templates Hook
export function useTemplates(filters?: { category?: string; type?: string; search?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.templates(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.category && filters.category !== 'all') params.set('category', filters.category)
      if (filters?.type) params.set('type', filters.type)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.limit) params.set('limit', filters.limit.toString())

      const res = await fetch(`/api/templates?${params}`)
      if (!res.ok) throw new Error('Failed to fetch templates')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Single Template Hook
export function useTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.template(id),
    queryFn: async () => {
      const res = await fetch(`/api/templates/${id}`)
      if (!res.ok) throw new Error('Failed to fetch template')
      return res.json()
    },
    enabled: !!id,
  })
}

// Generations Hook
export function useGenerations(filters?: { type?: string; limit?: number }) {
  const limit = filters?.limit ?? 50
  return useQuery({
    queryKey: queryKeys.generations(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      if (filters?.type && filters.type !== 'all') params.set('type', filters.type)

      const res = await fetch(`/api/generations?${params}`)
      if (!res.ok) throw new Error('Failed to fetch generations')
      return res.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// User Wallet Hook
export function useUserWallet() {
  return useQuery({
    queryKey: queryKeys.userWallet(),
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) throw new Error('Failed to fetch user data')
      const data = await res.json()
      return data.wallet as UserWallet
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Generate Mutation Hook
export function useGenerate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      type: 'TEXT' | 'IMAGE' | 'VIDEO'
      prompt: string
      textType?: 'caption' | 'script' | 'copywriting'
      imageStyle?: string
      aspectRatio?: string
      duration?: number
      referenceUrl?: string
    }) => {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Generation failed')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate related queries after successful generation
      queryClient.invalidateQueries({ queryKey: ['generations'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userWallet() })
    },
  })
}

// Generation Status Hook - polls for status updates
export function useGenerationStatus(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.generationStatus(id || ''),
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/generate/status/${id}`)
      if (!res.ok) throw new Error('Failed to fetch generation status')
      return res.json() as Promise<Generation & { metadata?: Record<string, unknown> }>
    },
    enabled: !!id && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const data = query.state.data
      // Stop polling if completed or failed
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false
      }
      // Poll every 2 seconds for PENDING/PROCESSING
      return 2000
    },
    refetchIntervalInBackground: true,
    staleTime: 0, // Always fetch fresh data
  })
}

// Delete Generation Mutation Hook
export function useDeleteGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete generation')
      return res.json()
    },
    onSuccess: (_, id) => {
      // Remove deleted item optimistically from all cached generations queries
      queryClient.setQueriesData<{ generations: Generation[] }>(
        { queryKey: ['generations'] },
        (old) => old ? { ...old, generations: old.generations.filter((g) => g.id !== id) } : old
      )
      queryClient.invalidateQueries({ queryKey: ['generations'] })
    },
  })
}

// Toggle Generation Public Mutation Hook
export function useToggleGenerationPublic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Failed to toggle public')
      return res.json()
    },
    onSuccess: (updated) => {
      // Update the item in-place across all cached generations queries
      queryClient.setQueriesData<{ generations: Generation[] }>(
        { queryKey: ['generations'] },
        (old) => old
          ? { ...old, generations: old.generations.map((g) => g.id === updated.id ? { ...g, ...updated } : g) }
          : old
      )
      queryClient.invalidateQueries({ queryKey: ['generations'] })
    },
  })
}

// Use Template Mutation Hook
export function useTemplateUsage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/templates/${id}/use`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to increment usage')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() })
    },
  })
}

// Prefetch Functions (for better UX)
export function usePrefetchTemplate() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.template(id),
      queryFn: async () => {
        const res = await fetch(`/api/templates/${id}`)
        if (!res.ok) throw new Error('Failed to fetch template')
        return res.json()
      },
    })
  }
}

// Discovery Hook - fetches public generations from all users
export function useDiscovery(filters?: { type?: string; limit?: number; offset?: number }) {
  const limit = filters?.limit ?? 20
  const offset = filters?.offset ?? 0
  return useQuery({
    queryKey: queryKeys.discovery(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      params.set('offset', offset.toString())
      if (filters?.type && filters.type !== 'all') params.set('type', filters.type)

      const res = await fetch(`/api/discovery?${params}`)
      if (!res.ok) throw new Error('Failed to fetch discovery content')
      return res.json() as Promise<{
        generations: DiscoveryGeneration[]
        total: number
        hasMore: boolean
      }>
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Admin - Create Template mutation
export interface CreateTemplateInput {
  name: string
  description?: string
  prompt: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  category:
  | 'RAMADHAN'
  | 'CHINESE_NEW_YEAR'
  | 'NATIONAL_DAY'
  | 'TRENDING_MEME'
  | 'VIRAL_TEMPLATE'
  | 'BUSINESS'
  | 'SOCIAL_MEDIA'
  | 'MARKETING'
  tags?: string[]
  thumbnail?: string
  isPublic?: boolean
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create template')
      }
      return res.json() as Promise<Template>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

// Admin - Update Template mutation
export type UpdateTemplateInput = Partial<CreateTemplateInput>

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTemplateInput & { id: string }) => {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update template')
      }
      return res.json() as Promise<Template>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

// Admin - Delete Template mutation
export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete template')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
