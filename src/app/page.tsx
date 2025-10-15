import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to the app for embedded Shopify usage
  redirect('/app')
}
