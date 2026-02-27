import {
  Navbar,
  HeroSection,
  HowItWorksSection,
  TrendingTemplatesSection,
  PricingSection,
  Footer,
} from '@/components/landing'

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-slate-950 antialiased">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <TrendingTemplatesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
