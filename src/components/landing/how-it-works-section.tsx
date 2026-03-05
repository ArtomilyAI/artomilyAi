'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Card, CardContent } from '@/components/ui/card'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
    title: '1. Pilih Template, Langsung Mulai',
    description:
      'Bingung mulai dari mana? Tinggal pilih template yang sesuai. Sudah dirancang khusus buat UMKM dan kreator Indonesia, jadi kamu langsung fokus ke isi kontennya, bukan pusing soal format.',  
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.9959.9959 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
      </svg>
    ),
    title: '2. AI Generate Otomatis, Hasilnya Langsung Rapi',
    description:
      'Isi detail produk atau brandmu, AI langsung kerja. Hasilnya terstruktur, berbahasa Indonesia yang natural, dan relevan buat audiensmu. Bukan terjemahan kaku, tapi konten yang benar-benar nyambung.',  
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
      </svg>
    ),
    title: '3. Langsung Publish, Hemat Waktu hingga 90%',
    description:
      'Hasil langsung siap. Review sebentar, lalu posting. Yang biasanya makan 3 sampai 5 jam kini selesai dalam hitungan detik. Tidak perlu freelancer, tidak perlu agency, tidak perlu nunggu.',
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.how-it-works-title', { opacity: 0, y: 40 })
      gsap.set('.how-it-works-step', { opacity: 0, y: 60 })

      gsap.to('.how-it-works-title', {
        scrollTrigger: {
          trigger: '.how-it-works-title',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      })

      gsap.to('.how-it-works-step', {
        scrollTrigger: {
          trigger: '.how-it-works-steps',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-16 bg-white dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="how-it-works-title text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight mb-4">
              Dari Masalah ke Konten Siap Posting, dalam 3 Langkah
            </h2>
            <p className="how-it-works-title text-slate-600 dark:text-slate-400 text-lg">
              Yang biasanya makan waktu berjam-jam, kini selesai dalam hitungan detik.
              Tanpa skill khusus. Tanpa tools yang ribet.
            </p>
          </div>
        </div>

        <div className="how-it-works-steps grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="how-it-works-step group border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
