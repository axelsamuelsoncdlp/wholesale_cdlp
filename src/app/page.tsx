import { redirect } from 'next/navigation'
import { checkAuthentication } from '@/lib/auth'

export default async function Home() {
  // Check if user is already authenticated
  const authResult = await checkAuthentication()
  
  if (authResult.isAuthenticated) {
    // User is authenticated, go to app
    redirect('/app')
  } else {
    // User is not authenticated, go to login
    redirect('/auth/login')
  }
}
