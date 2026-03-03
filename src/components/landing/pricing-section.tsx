'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for individuals just getting started with AI content.',
    features: [
      '5 AI Generations per day',
      'Access to standard templates',
      'Standard resolution images',
    ],
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
    buttonHref: '/auth/register',
    popular: false,
  },
  {
    name: 'Pro Creator',
    price: '$29',
    period: '/month',
    description: 'For professionals who need unlimited creative power.',
    features: [
      'Unlimited AI Generations',
      'All Premium & Seasonal Templates',
      'Brand Voice Customization',
      '4K Image Exports',
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    buttonHref: '/auth/register?plan=pro',
    popular: true,
  },
]

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.pricing-header', { opacity: 0, y: 40 })
      gsap.set('.pricing-card', { opacity: 0, y: 60 })

      gsap.to('.pricing-header', {
        scrollTrigger: {
          trigger: '.pricing-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      })

      gsap.to('.pricing-card', {
        scrollTrigger: {
          trigger: '.pricing-cards',
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
      id="pricing"
      className="py-20 bg-white dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="pricing-header text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Choose the plan that fits your creative needs. Cancel anytime.
          </p>
        </div>

        <div className="pricing-cards grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`pricing-card relative flex flex-col overflow-hidden ${plan.popular
                  ? 'bg-slate-900 dark:bg-slate-800 text-white border-transparent'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none -mr-16 -mt-16" />
              )}
              <CardContent className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                  >
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <Badge className="bg-primary text-white text-xs font-bold">
                      Most Popular
                    </Badge>
                  )}
                </div>

                <div className="flex items-end gap-1 mb-6">
                  <span
                    className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`mb-1 ${plan.popular ? 'text-slate-400' : 'text-slate-500'
                      }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <p
                  className={`text-sm mb-8 ${plan.popular ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {plan.description}
                </p>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-center gap-3 text-sm ${plan.popular
                          ? 'text-slate-200'
                          : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`size-5 ${plan.popular ? 'text-primary' : 'text-green-500'
                          }`}
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={plan.buttonHref} className="w-full">
                  <Button
                    variant={plan.popular ? 'default' : 'outline'}
                    className={`w-full py-3 ${plan.popular
                        ? 'shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
