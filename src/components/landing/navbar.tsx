'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#pricing', label: 'Pricing' },
]

export function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(logoRef.current, { opacity: 0, y: -20 })
      gsap.set('.nav-link', { opacity: 0, y: -20 })
      gsap.set('.nav-button', { opacity: 0, y: -20 })

      gsap.to(logoRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      })

      gsap.to('.nav-link', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.2,
      })

      gsap.to('.nav-button', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.4,
      })
    }, navRef)

    return () => ctx.revert()
  }, [])

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 px-4 md:px-10 py-3"
    >
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2">
          <div ref={logoRef} className="flex items-center gap-2">
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
              ArtomilyAI
            </h2>
          </div>
        </Link>

        <nav className="hidden md:flex flex-1 justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="nav-button hidden md:flex h-9 px-4 text-slate-700 dark:text-slate-200"
            >
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="nav-button h-9 px-4 shadow-sm bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
