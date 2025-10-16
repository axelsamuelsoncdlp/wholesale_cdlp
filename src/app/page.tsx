import { redirect } from 'next/navigation'

export default async function Home() {
  // Redirect to login page for authentication
  redirect('/login')
}
