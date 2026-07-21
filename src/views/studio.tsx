import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack } from '@hanzo/gui'
import { Caps, Plain } from './ui'
import { Stories } from './stories'
import { Reader } from './story'
import { Builder } from './builder'

type Route = { name: 'index' } | { name: 'read'; id: string } | { name: 'build'; id?: string }

/** A tracked-caps nav link. */
function NavItem({ active, onPress, children }: { active: boolean; onPress: () => void; children: string }) {
  return (
    <Caps
      cursor="pointer"
      onPress={onPress}
      fontSize={12}
      color={active ? '#ffffff' : 'rgba(255,255,255,0.5)'}
      hoverStyle={{ color: '#ffffff' }}
    >
      {children}
    </Caps>
  )
}

/** The one bit of persistent chrome for index/builder — thin and quiet. */
function TopBar({
  route,
  go,
  who,
  onSignOut,
}: {
  route: Route
  go: (r: Route) => void
  who: string
  onSignOut: () => void
}) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={26}
      paddingVertical={16}
      borderBottomWidth={1}
      borderColor="rgba(255,255,255,0.08)"
      backgroundColor="#050506"
    >
      <Caps letterSpacing={4} color="rgba(255,255,255,0.9)" cursor="pointer" onPress={() => go({ name: 'index' })}>
        Frame Story
      </Caps>
      <XStack alignItems="center" gap={22}>
        <NavItem active={route.name === 'index'} onPress={() => go({ name: 'index' })}>
          Index
        </NavItem>
        <NavItem active={route.name === 'build'} onPress={() => go({ name: 'build' })}>
          Compose
        </NavItem>
        <Caps fontSize={11} color="rgba(255,255,255,0.35)" maxWidth={160} numberOfLines={1}>
          {who}
        </Caps>
        <Plain size="$2" tone="rgba(255,255,255,0.6)" onPress={onSignOut}>
          Sign out
        </Plain>
      </XStack>
    </XStack>
  )
}

/**
 * Signed-in shell. A tiny route state (no router dependency) switches between
 * the index, the reader (chromeless, immersive) and the builder.
 */
export function Studio() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'
  const [route, setRoute] = useState<Route>({ name: 'index' })

  if (route.name === 'read') {
    return (
      <YStack minHeight="100vh" backgroundColor="#050506">
        <Reader id={route.id} onExit={() => setRoute({ name: 'index' })} />
      </YStack>
    )
  }

  return (
    <YStack minHeight="100vh" backgroundColor="#050506">
      <TopBar route={route} go={setRoute} who={who} onSignOut={() => logout()} />
      {route.name === 'index' ? (
        <Stories
          onOpen={(id) => setRoute({ name: 'read', id })}
          onCompose={() => setRoute({ name: 'build' })}
        />
      ) : (
        <Builder initialId={route.id} />
      )}
    </YStack>
  )
}
