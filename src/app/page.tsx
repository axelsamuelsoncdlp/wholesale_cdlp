'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to app - no login needed
    router.push('/app')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">CDLP Linesheet Generator</h1>
        <p className="text-gray-600 mt-2">Redirecting to application...</p>
      </div>
    </div>
  )
}
