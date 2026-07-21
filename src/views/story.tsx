import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner } from '@hanzo/gui'
import { FullBleed, Caps, Plain, Solid } from './ui'
import { type Story, type Block, formatDate } from '../lib/model'

/** A quiet text passage — centred column, wide negative space above and below. */
function TextBeat({ body }: { body: string }) {
  return (
    <YStack
      minHeight="72vh"
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={30}
      paddingVertical={120}
      backgroundColor="#050506"
    >
      <Paragraph
        maxWidth={620}
        textAlign="center"
        color="rgba(255,255,255,0.9)"
        fontSize={24}
        lineHeight={38}
        fontWeight="300"
      >
        {body}
      </Paragraph>
    </YStack>
  )
}

/** A full-bleed image beat with a small tracked-caps caption. */
function ImageBeat({ block }: { block: Block }) {
  return (
    <FullBleed src={block.image_url} height="100vh" minHeight={560} dim={0.22}>
      {block.caption ? (
        <XStack position="absolute" left={0} right={0} bottom={0} paddingHorizontal={30} paddingVertical={30}>
          <Caps color="rgba(255,255,255,0.82)">{block.caption}</Caps>
        </XStack>
      ) : null}
    </FullBleed>
  )
}

/**
 * Story reader — the cinematic scroll. A title card, then the ordered beats
 * (image / text) with slow rhythm and near-zero chrome, then an end card back
 * to the index. The page itself scrolls; each beat fills the frame.
 */
export function Reader({ id, onExit }: { id: string; onExit: () => void }) {
  const story = useQuery<Story>('stories', { filter: `id = "${id}"`, realtime: false })
  const blocks = useQuery<Block>('blocks', { filter: `story_id = "${id}"`, sort: 'order', realtime: false })

  if (story.isLoading || blocks.isLoading) {
    return (
      <YStack minHeight="100vh" alignItems="center" justifyContent="center" gap={16} backgroundColor="#050506">
        <Spinner size="large" />
        <Caps color="rgba(255,255,255,0.5)">Loading</Caps>
      </YStack>
    )
  }

  const s = story.data[0]
  if (!s) {
    return (
      <YStack minHeight="100vh" alignItems="center" justifyContent="center" gap={20} backgroundColor="#050506">
        <Paragraph color="rgba(255,255,255,0.7)">That essay isn’t available.</Paragraph>
        <Solid size="$4" onPress={onExit}>Back to all essays</Solid>
      </YStack>
    )
  }

  const meta = [s.byline, formatDate(s.published_at)].filter(Boolean).join('   ·   ')

  return (
    <YStack backgroundColor="#050506">
      <FullBleed src={s.cover_url} height="100vh" minHeight={640} dim={0.42}>
        <XStack position="absolute" top={0} left={0} paddingHorizontal={26} paddingVertical={24}>
          <Plain size="$3" tone="rgba(255,255,255,0.82)" onPress={onExit}>
            ← Index
          </Plain>
        </XStack>
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems="center"
          justifyContent="center"
          gap={22}
          paddingHorizontal={30}
        >
          {meta ? (
            <Caps color="rgba(255,255,255,0.6)" letterSpacing={5}>
              {meta}
            </Caps>
          ) : null}
          <Text
            color="#ffffff"
            fontSize={66}
            lineHeight={68}
            fontWeight="200"
            letterSpacing={-1}
            textAlign="center"
            maxWidth={880}
            $sm={{ fontSize: 40, lineHeight: 43 }}
          >
            {s.title}
          </Text>
          <Caps color="rgba(255,255,255,0.42)" fontSize={11} marginTop={18}>
            Scroll ↓
          </Caps>
        </YStack>
      </FullBleed>

      {blocks.data.map((block) =>
        block.kind === 'text' ? (
          <TextBeat key={block.id} body={block.body} />
        ) : (
          <ImageBeat key={block.id} block={block} />
        ),
      )}

      <YStack
        minHeight="60vh"
        alignItems="center"
        justifyContent="center"
        gap={22}
        paddingVertical={110}
        backgroundColor="#050506"
      >
        <Caps color="rgba(255,255,255,0.38)" letterSpacing={5}>
          End
        </Caps>
        <Text color="#ffffff" fontSize={30} fontWeight="200" textAlign="center" maxWidth={640}>
          {s.title}
        </Text>
        <Solid size="$4" onPress={onExit}>
          Back to all essays
        </Solid>
      </YStack>
    </YStack>
  )
}
