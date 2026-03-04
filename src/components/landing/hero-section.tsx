'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import Image from 'next/image'
import { Zap } from 'lucide-react'

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states immediately to prevent flash
      gsap.set(['.hero-badge', '.hero-title', '.hero-description', '.hero-social-proof'], {
        opacity: 0,
        y: 30,
      })
      gsap.set('.hero-button', { opacity: 0, y: 20 })
      gsap.set('.hero-image', { opacity: 0, x: 50 })

      // Then animate in
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.to('.hero-badge', {
        y: 0,
        opacity: 1,
        duration: 0.6,
      })
        .to(
          '.hero-title',
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          '-=0.4'
        )
        .to(
          '.hero-description',
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
          },
          '-=0.4'
        )
        .to(
          '.hero-button',
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.3'
        )
        .to(
          '.hero-social-proof',
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
          },
          '-=0.2'
        )
        .to(
          '.hero-image',
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
          },
          '-=0.6'
        )

      // Floating animation for the decorative gradient
      gsap.to('.hero-gradient', {
        scale: 1.1,
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="px-4 py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <div className="flex flex-col gap-4">
            <Badge
              variant="secondary"
              className="hero-badge w-fit mx-auto lg:mx-0 gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 px-3 py-1"
            >
              <Zap className="size-4" />
              Qwen & Wan Powered
            </Badge>

            <h1 className="hero-title text-slate-900 dark:text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              Create Cultural Content in{' '}
              <span className="text-primary">Seconds</span>
            </h1>

            <p className="hero-description text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-[600px] mx-auto lg:mx-0">
              Our AI understands local nuances to generate high-quality,
              culturally relevant marketing copy and visuals instantly. Stop
              guessing, start connecting.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="hero-button h-12 px-6 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 bg-primary hover:bg-primary/90"
              >
                Start Creating for Free
              </Button>
            </Link>
            <Link href="#templates">
              <Button
                size="lg"
                variant="outline"
                className="hero-button h-12 px-6 text-base gap-2 bg-transparent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
                View Templates
              </Button>
            </Link>
          </div>

          <div className="hero-social-proof mt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-2">
              <Avatar className="size-8 border-2 border-white dark:border-slate-950">
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <Avatar className="size-8 border-2 border-white dark:border-slate-950">
                <AvatarFallback className="bg-slate-300 text-slate-600 text-xs">
                  AK
                </AvatarFallback>
              </Avatar>
              <Avatar className="size-8 border-2 border-white dark:border-slate-950">
                <AvatarFallback className="bg-slate-400 text-slate-100 text-xs">
                  MS
                </AvatarFallback>
              </Avatar>
            </div>
            <p>Trusted by 10,000+ creators</p>
          </div>
        </div>

        <div className="hero-image flex-1 w-full relative">
          <div className="hero-gradient absolute -top-10 -right-10 w-2/3 h-2/3 bg-gradient-to-br from-primary/30 to-emerald-400/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <Image
              src="/dashboard2.png"
              alt="BuatinAi Dashboard Preview"
              fill
              className="object-cover object-top"
              priority
            />

            <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-start gap-4">
              <div className="size-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Content Generated
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  A humorous meme image based on the prompt "When you ask AI to create a meme but it takes it too literally"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
