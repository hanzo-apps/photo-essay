import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner } from '@hanzo/gui'
import { FullBleed, Caps, Ghost, Solid } from './ui'
import { type Story, formatDate } from '../lib/model'

/** One published essay as a tall cinematic poster tile. */
function Poster({ story, onOpen }: { story: Story; onOpen: (id: string) => void }) {
  const meta = [story.byline, formatDate(story.published_at)].filter(Boolean).join('   ·   ')
  return (
    <YStack
      width={344}
      $sm={{ width: '100%' }}
      cursor="pointer"
      onPress={() => onOpen(story.id)}
      hoverStyle={{ opacity: 0.92 }}
      pressStyle={{ opacity: 0.82 }}
    >
      <FullBleed src={story.cover_url} height={468} minHeight={468} dim={0.14}>
        <YStack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          height="62%"
          backgroundColor="rgba(4,4,6,0.5)"
        />
        <YStack position="absolute" left={0} right={0} bottom={0} paddingHorizontal={22} paddingVertical={24} gap={9}>
          <Text color="#ffffff" fontSize={27} lineHeight={29} fontWeight="300">
            {story.title}
          </Text>
          {meta ? (
            <Caps color="rgba(255,255,255,0.7)" fontSize={11}>
              {meta}
            </Caps>
          ) : null}
        </YStack>
      </FullBleed>
    </YStack>
  )
}

/**
 * Story index — poster tiles of every published essay in your org. Click a
 * poster to fall into the reader; compose a new essay from the header.
 */
export function Stories({
  onOpen,
  onCompose,
}: {
  onOpen: (id: string) => void
  onCompose: () => void
}) {
  const { data, isLoading, error } = useQuery<Story>('stories', {
    filter: 'published = true',
    sort: '-published_at',
    realtime: false,
  })

  return (
    <YStack
      width="100%"
      maxWidth={1240}
      alignSelf="center"
      paddingHorizontal={40}
      paddingVertical={54}
      gap={40}
      $sm={{ paddingHorizontal: 22, paddingVertical: 32 }}
    >
      <YStack gap={12}>
        <Caps color="rgba(255,255,255,0.42)" letterSpacing={5}>
          Frame Story · Index
        </Caps>
        <XStack alignItems="flex-end" justifyContent="space-between" gap={20} flexWrap="wrap">
          <Text color="#ffffff" fontSize={46} lineHeight={48} fontWeight="200" letterSpacing={-1}>
            Published essays
          </Text>
          <Ghost size="$4" onPress={onCompose}>
            Compose
          </Ghost>
        </XStack>
      </YStack>

      {isLoading ? (
        <XStack alignItems="center" gap={12} opacity={0.6} paddingVertical={40}>
          <Spinner /> <Text color="#fff">Loading essays…</Text>
        </XStack>
      ) : error ? (
        <Paragraph color="$red10" maxWidth={560}>
          Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
        </Paragraph>
      ) : data.length === 0 ? (
        <YStack
          gap={18}
          paddingVertical={64}
          paddingHorizontal={34}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.1)"
          alignItems="center"
        >
          <Caps color="rgba(255,255,255,0.4)">Nothing published yet</Caps>
          <Paragraph color="rgba(255,255,255,0.62)" textAlign="center" maxWidth={440} fontWeight="300">
            An essay is a sequence of image and text beats. Build the first one and it lands here as a poster.
          </Paragraph>
          <Solid size="$4" onPress={onCompose}>
            Compose the first essay
          </Solid>
        </YStack>
      ) : (
        <XStack flexWrap="wrap" gap={22}>
          {data.map((story) => (
            <Poster key={story.id} story={story} onOpen={onOpen} />
          ))}
        </XStack>
      )}
    </YStack>
  )
}
