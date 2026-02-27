'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#blog', label: 'Blog' },
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
        <div ref={logoRef} className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            ArtomilyAI
          </h2>
        </div>

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

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="nav-button hidden md:flex h-9 px-4 text-slate-700 dark:text-slate-200"
          >
            Login
          </Button>
          <Button className="nav-button h-9 px-4 shadow-sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
