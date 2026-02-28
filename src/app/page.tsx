import {
  Navbar,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  Footer,
} from '@/components/landing'
import { TrendingTemplatesSection } from '@/components/landing/trending-templates-section'
import { TemplateService } from '@/services/template.service'

export default async function Home() {
  // Server-side data fetching for SSR - optimal for SEO
  const { templates } = await TemplateService.getTemplates({ limit: 6 })

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-slate-950 antialiased">
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
