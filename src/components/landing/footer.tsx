'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Separator } from '@/components/ui/separator'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

const footerLinks = {
  product: [
    { label: 'Fitur', href: '#features' },
    { label: 'Template', href: '#templates' },
    { label: 'Harga', href: '#pricing' },
  ],
  resources: [
    { label: 'Blog', href: '#' },
    { label: 'Pusat Bantuan', href: '#' },
    { label: 'Dokumentasi API', href: '#' },
  ],
  company: [
    { label: 'Tentang Kami', href: '#' },
    { label: 'Kontak', href: '#' },
    { label: 'Hukum', href: '#' },
  ],
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set('.footer-content', { opacity: 0, y: 40 })

      gsap.to('.footer-content', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      })
    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="footer-content grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="BuatinAi Logo" width={32} height={32} className="size-8 rounded-lg" />
              <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                BuatinAi
              </h2>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs">
              Teman bikin konten untuk UMKM dan kreator Indonesia.
              Cepat, rapi, dan siap diposting dalam hitungan detik.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">
              Produk
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">
              Sumber Daya
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">
              Perusahaan
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            © 2025 BuatinAi. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-300">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-300">
              Syarat dan Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
