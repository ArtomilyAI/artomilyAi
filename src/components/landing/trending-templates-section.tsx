'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const templates = [
  {
    title: 'Ramadan Kareem',
    category: 'Seasonal',
    region: 'Middle East & Asia',
    description:
      'Generate respectful and engaging greetings, iftar invitations, and retail promotions.',
    type: 'Post + Story',
    typeIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4"
      >
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    ),
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    title: 'Lunar New Year',
    category: 'Holiday',
    region: 'China & SE Asia',
    description:
      'Create vibrant red-envelope campaigns and family-oriented messaging.',
    type: 'Video Script',
    typeIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4"
      >
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
      </svg>
    ),
    gradient: 'from-red-500/20 to-rose-600/20',
  },
  {
    title: 'Trending Memes',
    category: 'Viral',
    region: 'Global Internet',
    description:
      'Instantly capitalize on the latest viral formats with brand-safe adaptations.',
    type: 'Image Gen',
    typeIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4"
      >
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
    ),
    gradient: 'from-purple-500/20 to-pink-600/20',
  },
]

export function TrendingTemplatesSection() {
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
            href="#"
            className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1 group"
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
          {templates.map((template, index) => (
            <Card
              key={index}
              className="template-card bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div
                className={`h-48 bg-gradient-to-br ${template.gradient} relative group-hover:scale-105 transition-transform duration-500 flex items-center justify-center`}
              >
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold"
                >
                  {template.category}
                </Badge>
                <div className="size-16 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-8 text-white/80"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {template.region}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {template.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    {template.typeIcon}
                    <span>{template.type}</span>
                  </div>
                  <span className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors">
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
          ))}
        </div>
      </div>
    </section>
  )
}
