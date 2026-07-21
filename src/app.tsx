import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner } from '@hanzo/gui'
import { Callback } from './auth/callback'
import { Landing } from './views/landing'
import { Studio } from './views/studio'

/**
 * Top-level route + auth gate — no router dependency (one static SPA):
 *   /auth/callback  → finish the PKCE exchange, then land home
 *   signed out      → the cinematic title card (Landing)
 *   signed in       → the essay studio (index · reader · builder)
 */
export function App() {
  const { isAuthenticated, isLoading } = useIam()

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
    return <Callback />
  }
  if (isLoading) {
    return (
      <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" backgroundColor="#050506">
        <Spinner size="large" />
      </YStack>
    )
  }
  return isAuthenticated ? <Studio /> : <Landing />
}
