'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SimpleLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Just redirect to app - no authentication needed
    router.push('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CDLP Linesheet Generator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Simple Login - Click to Enter
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Entering...' : 'Enter Platform'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}