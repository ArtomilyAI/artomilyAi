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

// Query Keys - centralized for easy invalidation
export const queryKeys = {
  templates: (filters?: { category?: string; type?: string; search?: string; limit?: number }) => 
    ['templates', filters] as const,
  template: (id: string) => ['template', id] as const,
  generations: (filters?: { type?: string; limit?: number }) => ['generations', filters] as const,
  generation: (id: string) => ['generation', id] as const,
  userWallet: () => ['user', 'wallet'] as const,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.generations() })
      queryClient.invalidateQueries({ queryKey: queryKeys.userWallet() })
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generations() })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generations() })
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
