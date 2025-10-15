import { redirect } from 'next/navigation'

export default async function Home() {
  // Redirect directly to app without authentication check
  redirect('/app')
}
