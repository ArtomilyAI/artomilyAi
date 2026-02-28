'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

// Template type from database
interface Template {
  id: string
  name: string
  description: string | null
  prompt: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'UPSCALE'
  category: string
  tags: string[]
  thumbnail: string | null
  usageCount: number
}

interface TrendingTemplatesSectionProps {
  templates: Template[]
}

// Category display config
const CATEGORY_CONFIG: Record<string, { gradient: string; icon: string }> = {
  RAMADHAN: { gradient: 'from-amber-500/20 to-orange-600/20', icon: '🌙' },
  CHINESE_NEW_YEAR: { gradient: 'from-red-500/20 to-rose-600/20', icon: '🧧' },
  NATIONAL_DAY: { gradient: 'from-blue-500/20 to-indigo-600/20', icon: '🎆' },
  TRENDING_MEME: { gradient: 'from-purple-500/20 to-pink-600/20', icon: '😂' },
  VIRAL_TEMPLATE: { gradient: 'from-pink-500/20 to-red-600/20', icon: '🔥' },
  BUSINESS: { gradient: 'from-slate-500/20 to-gray-600/20', icon: '💼' },
  SOCIAL_MEDIA: { gradient: 'from-cyan-500/20 to-blue-600/20', icon: '📱' },
  MARKETING: { gradient: 'from-green-500/20 to-emerald-600/20', icon: '📈' },
}

const TYPE_ICONS: Record<string, string> = {
  TEXT: '📝',
  IMAGE: '🖼️',
  VIDEO: '🎬',
  UPSCALE: '🔍',
}

export function TrendingTemplatesSection({ templates }: TrendingTemplatesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.templates-header', { opacity: 0, y: 40 })
      gsap.set('.template-card', { opacity: 0, y: 60 })

      gsap.to('.templates-header', {
        scrollTrigger: {
          trigger: '.templates-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      })

      gsap.to('.template-card', {
        scrollTrigger: {
          trigger: '.templates-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Fallback to static templates if no data
  const displayTemplates = templates.length > 0 ? templates : getFallbackTemplates()

  return (
    <section
      ref={sectionRef}
      id="templates"
      className="py-16 bg-slate-50 dark:bg-slate-900/50"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="templates-header mb-10 flex items-center justify-between">
          <h2 className="text-slate-900 dark:text-white text-2xl font-bold">
            Trending Cultural Templates
          </h2>
          <Link
            href="/dashboard/templates"
            className="text-[#506ced] hover:text-[#506ced]/80 font-semibold text-sm flex items-center gap-1 group"
          >
            View all templates
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 transition-transform group-hover:translate-x-1"
            >
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          </Link>
        </div>

        <div className="templates-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTemplates.map((template, index) => {
            const config = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.SOCIAL_MEDIA
            const typeIcon = TYPE_ICONS[template.type] || '📄'
            
            return (
              <Link href={`/dashboard/templates?select=${template.id}`} key={template.id || index}>
                <Card className="template-card bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                  <div
                    className={`h-48 bg-gradient-to-br ${config.gradient} relative group-hover:scale-105 transition-transform duration-500 flex items-center justify-center`}
                  >
                    <Badge
                      variant="secondary"
                      className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold"
                    >
                      {formatCategory(template.category)}
                    </Badge>
                    <div className="size-16 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-4xl">{config.icon}</span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-[#506ced] uppercase tracking-wide">
                        {template.tags?.slice(0, 2).join(' • ') || 'General'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#506ced] transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {template.description || template.prompt.slice(0, 80) + '...'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <span>{typeIcon}</span>
                        <span>{template.type}</span>
                      </div>
                      <span className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#506ced] group-hover:text-white transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5"
                        >
                          <path d="M6 6v2h8.59L5 17.59 6.41 19 16 9.41V18h2V6z" />
                        </svg>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Helper to format category enum to display text
function formatCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Fallback static templates if database is empty
function getFallbackTemplates() {
  return [
    {
      id: 'fallback-1',
      name: 'Ramadan Kareem',
      description: 'Generate respectful and engaging greetings, iftar invitations, and retail promotions.',
      prompt: '',
      type: 'TEXT' as const,
      category: 'RAMADHAN',
      tags: ['Seasonal', 'Middle East & Asia'],
      thumbnail: null,
      usageCount: 0,
    },
    {
      id: 'fallback-2',
      name: 'Lunar New Year',
      description: 'Create vibrant red-envelope campaigns and family-oriented messaging.',
      prompt: '',
      type: 'TEXT' as const,
      category: 'CHINESE_NEW_YEAR',
      tags: ['Holiday', 'China & SE Asia'],
      thumbnail: null,
      usageCount: 0,
    },
    {
      id: 'fallback-3',
      name: 'Trending Memes',
      description: 'Instantly capitalize on the latest viral formats with brand-safe adaptations.',
      prompt: '',
      type: 'IMAGE' as const,
      category: 'TRENDING_MEME',
      tags: ['Viral', 'Global Internet'],
      thumbnail: null,
      usageCount: 0,
    },
  ]
}
