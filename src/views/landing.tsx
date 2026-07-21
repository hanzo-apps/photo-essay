import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import { FullBleed, Caps, Solid, Plain } from './ui'
import { FRAMES } from '../lib/model'

/**
 * Signed-out title card. Full-bleed cinematic frame, thin white type anchored
 * low-left, one action: PKCE sign-in with Hanzo (hanzo.id). No local credential
 * form — Hanzo IAM owns every credential interaction. This is the public,
 * pre-auth face of the app.
 */
export function Landing() {
  const { login, isLoading } = useIam()

  return (
    <FullBleed src={FRAMES.dusk} height="100vh" minHeight={640} dim={0.36}>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        justifyContent="space-between"
        paddingHorizontal={64}
        paddingVertical={44}
        $sm={{ paddingHorizontal: 26, paddingVertical: 28 }}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <Caps color="rgba(255,255,255,0.85)" letterSpacing={4}>
            Frame Story
          </Caps>
          <Plain size="$3" tone="rgba(255,255,255,0.82)" onPress={() => login()}>
            Sign in
          </Plain>
        </XStack>

        <YStack gap={22} maxWidth={780}>
          <Caps color="rgba(255,255,255,0.58)" letterSpacing={5}>
            Visual Photo Essays
          </Caps>
          <Text
            color="#ffffff"
            fontSize={74}
            lineHeight={76}
            fontWeight="200"
            letterSpacing={-1}
            $sm={{ fontSize: 44, lineHeight: 47 }}
          >
            Scroll it like a story.
          </Text>
          <Paragraph
            color="rgba(255,255,255,0.74)"
            fontSize={19}
            lineHeight={30}
            fontWeight="300"
            maxWidth={560}
          >
            Frame Story sequences full-bleed images and quiet text passages into a cinematic
            vertical scroll. Order the beats, publish, and let readers fall through it.
          </Paragraph>
          <XStack alignItems="center" gap={20} marginTop={8} flexWrap="wrap">
            <Solid size="$5" disabled={isLoading} onPress={() => login()}>
              {isLoading ? 'Opening…' : 'Enter with Hanzo'}
            </Solid>
            <Caps color="rgba(255,255,255,0.5)" fontSize={11}>
              PKCE · hanzo.id
            </Caps>
          </XStack>
        </YStack>
      </YStack>
    </FullBleed>
  )
}
