import {
  Navbar,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  Footer,
} from '@/components/landing'
import { TrendingTemplatesSection } from '@/components/landing/trending-templates-section'
import { TemplateService } from '@/services/template.service'

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Server-side data fetching - will run at request time, not build time
  let templates: Awaited<ReturnType<typeof TemplateService.getTemplates>>['templates'] = []
  try {
    const result = await TemplateService.getTemplates({ limit: 6 })
    templates = result.templates
  } catch {
    // Silently fail if database is not available during build
    templates = []
  }

  return (
    <div className="relative flex flex-col bg-white dark:bg-slate-950">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <TrendingTemplatesSection templates={templates} />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
