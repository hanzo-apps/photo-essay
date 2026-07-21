import { useState } from 'react'
import { useQuery, useMutation, type BaseRecord } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Button, Spinner } from '@hanzo/gui'
import { FullBleed, Caps, Field, Plain, Solid, Ghost } from './ui'
import { type Story, type Block, type BlockKind, SAMPLE_STORY, SAMPLE_BLOCKS } from '../lib/model'

/** One beat editor: image (url + caption) or text (body), with reorder + delete. */
function BlockEditor({
  block,
  index,
  count,
  onMove,
  onDelete,
  onSaved,
}: {
  block: Block
  index: number
  count: number
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  onSaved: () => void
}) {
  const update = useMutation('blocks', 'update')
  const [imageUrl, setImageUrl] = useState(block.image_url)
  const [caption, setCaption] = useState(block.caption)
  const [body, setBody] = useState(block.body)
  const changed = imageUrl !== block.image_url || caption !== block.caption || body !== block.body

  async function save() {
    await update.mutate({ id: block.id, image_url: imageUrl, caption, body })
    onSaved()
  }

  return (
    <YStack
      borderWidth={1}
      borderColor="rgba(255,255,255,0.12)"
      backgroundColor="rgba(255,255,255,0.02)"
      padding={18}
      gap={14}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Caps color="rgba(255,255,255,0.5)">
          {String(index + 1).padStart(2, '0')} · {block.kind}
        </Caps>
        <XStack gap={6} alignItems="center">
          <Button size="$2" borderRadius={0} disabled={index === 0} onPress={() => onMove(-1)}>
            ↑
          </Button>
          <Button size="$2" borderRadius={0} disabled={index === count - 1} onPress={() => onMove(1)}>
            ↓
          </Button>
          <Plain size="$2" tone="$red10" onPress={onDelete}>
            Delete
          </Plain>
        </XStack>
      </XStack>

      {block.kind === 'image' ? (
        <YStack gap={14}>
          <FullBleed src={imageUrl} height={140} minHeight={140} dim={0.15} />
          <Field label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://…  (blank uses a bundled frame)" />
          <Field label="Caption" value={caption} onChangeText={setCaption} placeholder="West Pier — 7:15 pm" />
        </YStack>
      ) : (
        <Field label="Passage" value={body} onChangeText={setBody} placeholder="A quiet line of prose between the images…" multiline />
      )}

      <XStack justifyContent="flex-end">
        <Button size="$3" borderRadius={0} theme="active" disabled={!changed || update.isLoading} onPress={save}>
          Save beat
        </Button>
      </XStack>
    </YStack>
  )
}

/** Edit one essay: cover/meta, publish state, and the ordered list of beats. */
function StoryEditor({ story, onDeleted }: { story: Story; onDeleted: () => void }) {
  const { data: blocks, refetch } = useQuery<Block>('blocks', {
    filter: `story_id = "${story.id}"`,
    sort: 'order',
    realtime: false,
  })
  const updateStory = useMutation('stories', 'update')
  const deleteStory = useMutation('stories', 'delete')
  const createBlock = useMutation('blocks', 'create')
  const updateBlock = useMutation('blocks', 'update')
  const deleteBlock = useMutation('blocks', 'delete')

  const [title, setTitle] = useState(story.title)
  const [byline, setByline] = useState(story.byline)
  const [cover, setCover] = useState(story.cover_url)
  const metaChanged = title !== story.title || byline !== story.byline || cover !== story.cover_url

  async function saveMeta() {
    await updateStory.mutate({ id: story.id, title, byline, cover_url: cover })
  }

  async function togglePublish() {
    await updateStory.mutate({
      id: story.id,
      published: !story.published,
      published_at: story.published_at || new Date().toISOString(),
    })
  }

  async function addBlock(kind: BlockKind) {
    const last = blocks[blocks.length - 1]
    const order = (last?.order ?? 0) + 1
    await createBlock.mutate({ story_id: story.id, kind, image_url: '', caption: '', body: '', order })
    await refetch()
  }

  async function move(i: number, dir: -1 | 1) {
    const a = blocks[i]
    const b = blocks[i + dir]
    if (!a || !b) return
    await updateBlock.mutate({ id: a.id, order: b.order })
    await updateBlock.mutate({ id: b.id, order: a.order })
    await refetch()
  }

  async function removeBlock(id: string) {
    await deleteBlock.mutate({ id })
    await refetch()
  }

  async function removeStory() {
    await deleteStory.mutate({ id: story.id })
    onDeleted()
  }

  return (
    <YStack flex={1} minWidth={320} gap={26}>
      <YStack gap={16}>
        <FullBleed src={cover} height={150} minHeight={150} dim={0.18}>
          <XStack position="absolute" left={0} right={0} bottom={0} paddingHorizontal={16} paddingVertical={14}>
            <Caps color={story.published ? 'rgba(150,230,170,0.9)' : 'rgba(255,255,255,0.6)'}>
              {story.published ? 'Published' : 'Draft'}
            </Caps>
          </XStack>
        </FullBleed>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="The Long Blue Hour" />
        <Field label="Byline" value={byline} onChangeText={setByline} placeholder="Your name" />
        <Field label="Cover URL" value={cover} onChangeText={setCover} placeholder="https://…  (blank uses a bundled frame)" />
        <XStack gap={10} flexWrap="wrap">
          <Button size="$3" borderRadius={0} theme="active" disabled={!metaChanged || updateStory.isLoading} onPress={saveMeta}>
            Save details
          </Button>
          {story.published ? (
            <Ghost size="$3" onPress={togglePublish}>
              Unpublish
            </Ghost>
          ) : (
            <Solid size="$3" onPress={togglePublish}>
              Publish
            </Solid>
          )}
          <Plain size="$3" tone="$red10" onPress={removeStory}>
            Delete essay
          </Plain>
        </XStack>
      </YStack>

      <YStack gap={14}>
        <XStack alignItems="center" justifyContent="space-between">
          <Caps color="rgba(255,255,255,0.5)">Beats · {blocks.length}</Caps>
          <XStack gap={8}>
            <Button size="$3" borderRadius={0} disabled={createBlock.isLoading} onPress={() => addBlock('image')}>
              + Image
            </Button>
            <Button size="$3" borderRadius={0} disabled={createBlock.isLoading} onPress={() => addBlock('text')}>
              + Text
            </Button>
          </XStack>
        </XStack>

        {blocks.length === 0 ? (
          <Paragraph color="rgba(255,255,255,0.5)" fontWeight="300">
            No beats yet. Add an image or a text passage — they play top to bottom in the reader.
          </Paragraph>
        ) : (
          blocks.map((block, i) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={i}
              count={blocks.length}
              onMove={(dir) => move(i, dir)}
              onDelete={() => removeBlock(block.id)}
              onSaved={refetch}
            />
          ))
        )}
      </YStack>
    </YStack>
  )
}

/**
 * Builder — pick or create an essay on the left, edit it on the right. Every
 * write carries the signed-in user's IAM token (providers.tsx), so essays are
 * org-scoped. "Load the sample essay" seeds a complete, publishable piece.
 */
export function Builder({ initialId }: { initialId?: string }) {
  const { data: stories, isLoading, refetch } = useQuery<Story>('stories', {
    sort: '-created',
    realtime: false,
  })
  const createStory = useMutation('stories', 'create')
  const createBlock = useMutation('blocks', 'create')
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId)

  async function newEssay() {
    const rec = (await createStory.mutate({
      title: 'Untitled essay',
      byline: '',
      cover_url: '',
      published: false,
      published_at: '',
    })) as BaseRecord
    await refetch()
    setSelectedId(rec.id)
  }

  async function loadSample() {
    const rec = (await createStory.mutate({
      ...SAMPLE_STORY,
      published: true,
      published_at: new Date().toISOString(),
    })) as BaseRecord
    let order = 1
    for (const b of SAMPLE_BLOCKS) {
      await createBlock.mutate({ story_id: rec.id, ...b, order })
      order += 1
    }
    await refetch()
    setSelectedId(rec.id)
  }

  const selected = stories.find((s) => s.id === selectedId)

  return (
    <YStack
      width="100%"
      maxWidth={1000}
      alignSelf="center"
      paddingHorizontal={40}
      paddingVertical={48}
      gap={34}
      $sm={{ paddingHorizontal: 20, paddingVertical: 30 }}
    >
      <YStack gap={10}>
        <Caps color="rgba(255,255,255,0.42)" letterSpacing={5}>
          Frame Story · Builder
        </Caps>
        <Text color="#ffffff" fontSize={46} lineHeight={48} fontWeight="200" letterSpacing={-1}>
          Compose
        </Text>
      </YStack>

      <XStack gap={30} flexWrap="wrap" alignItems="flex-start">
        <YStack width={280} $sm={{ width: '100%' }} gap={12}>
          <Caps color="rgba(255,255,255,0.5)">Your essays</Caps>
          <Button size="$3" borderRadius={0} theme="active" onPress={newEssay} disabled={createStory.isLoading}>
            + New essay
          </Button>

          {isLoading ? (
            <XStack alignItems="center" gap={10} opacity={0.6} paddingVertical={12}>
              <Spinner /> <Text color="#fff">Loading…</Text>
            </XStack>
          ) : stories.length === 0 ? (
            <YStack gap={12} paddingVertical={8}>
              <Paragraph color="rgba(255,255,255,0.5)" fontWeight="300">
                Nothing here yet. Start from a ready-made piece.
              </Paragraph>
              <Button size="$3" borderRadius={0} onPress={loadSample} disabled={createBlock.isLoading}>
                Load the sample essay
              </Button>
            </YStack>
          ) : (
            <YStack gap={8}>
              {stories.map((s) => {
                const active = s.id === selectedId
                return (
                  <YStack
                    key={s.id}
                    cursor="pointer"
                    onPress={() => setSelectedId(s.id)}
                    padding={13}
                    gap={5}
                    borderWidth={1}
                    borderColor={active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'}
                    backgroundColor={active ? 'rgba(255,255,255,0.06)' : 'transparent'}
                    hoverStyle={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <Text color="#ffffff" fontSize={15} fontWeight="400" numberOfLines={1}>
                      {s.title || 'Untitled essay'}
                    </Text>
                    <Caps color={s.published ? 'rgba(150,230,170,0.85)' : 'rgba(255,255,255,0.4)'} fontSize={10}>
                      {s.published ? 'Published' : 'Draft'}
                    </Caps>
                  </YStack>
                )
              })}
            </YStack>
          )}
        </YStack>

        {selected ? (
          <StoryEditor
            key={selected.id}
            story={selected}
            onDeleted={() => {
              setSelectedId(undefined)
              void refetch()
            }}
          />
        ) : (
          <YStack
            flex={1}
            minWidth={320}
            minHeight={280}
            alignItems="center"
            justifyContent="center"
            gap={12}
            borderWidth={1}
            borderColor="rgba(255,255,255,0.1)"
          >
            <Caps color="rgba(255,255,255,0.4)">Select an essay</Caps>
            <Paragraph color="rgba(255,255,255,0.5)" textAlign="center" maxWidth={320} fontWeight="300">
              Pick an essay on the left, or create a new one to start sequencing beats.
            </Paragraph>
          </YStack>
        )}
      </XStack>
    </YStack>
  )
}
