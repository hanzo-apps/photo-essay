import type { BaseRecord } from '@hanzo/base/react'
import dusk from '../assets/frame-dusk.svg'
import tide from '../assets/frame-tide.svg'
import city from '../assets/frame-city.svg'

/**
 * The bundled cinematic frames. They are self-contained SVG (no network), so
 * the reader, poster tiles and empty states always render — offline or before
 * an editor pastes real photo URLs in the builder.
 */
export const FRAMES = { dusk, tide, city }
export const FALLBACK_COVER = dusk

/** One row of the `stories` collection (schema.sql). */
export interface Story extends BaseRecord {
  title: string
  byline: string
  cover_url: string
  published: boolean
  published_at: string
}

export type BlockKind = 'image' | 'text'

/** One row of the `blocks` collection — an image beat or a text passage. */
export interface Block extends BaseRecord {
  story_id: string
  kind: BlockKind
  image_url: string
  caption: string
  body: string
  order: number
}

/** A block not yet written to Base (used to seed the sample essay). */
export type DraftBlock = Pick<Block, 'kind' | 'image_url' | 'caption' | 'body'>

/** A ready-to-publish demo essay, wired to the bundled frames. */
export const SAMPLE_STORY = {
  title: 'The Long Blue Hour',
  byline: 'Frame Story',
  cover_url: dusk,
}

export const SAMPLE_BLOCKS: DraftBlock[] = [
  {
    kind: 'text',
    image_url: '',
    caption: '',
    body: 'The light goes first, then the noise. For twenty minutes the city forgets to hurry — and the coast turns the colour of a held breath.',
  },
  { kind: 'image', image_url: dusk, caption: 'West Pier — 7:15 pm', body: '' },
  {
    kind: 'text',
    image_url: '',
    caption: '',
    body: 'Down at the waterline the tide has pulled back far enough to walk on the reflection of the sky.',
  },
  { kind: 'image', image_url: tide, caption: 'Low Tide — 7:48 pm', body: '' },
  {
    kind: 'text',
    image_url: '',
    caption: '',
    body: 'And then, all at once, the windows answer. The blue hour ends the way it began — quietly, from the inside out.',
  },
  { kind: 'image', image_url: city, caption: 'Downtown — 8:42 pm', body: '' },
]

/** Short, human date for bylines and poster tiles. Empty for unset/invalid. */
export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
