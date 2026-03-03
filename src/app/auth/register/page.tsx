import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import Image from 'next/image'

function RegisterContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src="/logo.svg" alt="BuatinAi Logo" width={32} height={32} className="size-8 rounded-lg" />
        <span className="text-2xl font-bold text-slate-900 dark:text-white">BuatinAi</span>
      </Link>
      <RegisterForm />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
