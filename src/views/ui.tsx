import type { ComponentProps, ReactNode } from 'react'
import { YStack, Text, Image, Input, TextArea, Button } from '@hanzo/gui'
import { FALLBACK_COVER } from '../lib/model'

type TextProps = ComponentProps<typeof Text>
type ButtonSize = ComponentProps<typeof Button>['size']

/** Small tracked capitals — the essay's only recurring bit of chrome. */
export function Caps(props: TextProps) {
  return (
    <Text
      textTransform="uppercase"
      letterSpacing={3}
      fontSize={12}
      fontWeight="500"
      color="rgba(255,255,255,0.66)"
      {...props}
    />
  )
}

/**
 * The button label colour is a text prop, which @hanzo/gui's Button (a styled
 * stack) does not take directly — so these three compositions set the frame on
 * Button and the label colour on a nested Text. One primitive per intent.
 */

/** White call-to-action with a dark label, sharp corners. */
export function Solid({
  children,
  onPress,
  size = '$5',
  disabled,
}: {
  children: string
  onPress: () => void
  size?: ButtonSize
  disabled?: boolean
}) {
  return (
    <Button
      size={size}
      disabled={disabled}
      onPress={onPress}
      backgroundColor="#ffffff"
      borderRadius={0}
      hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.86)' }}
      pressStyle={{ backgroundColor: 'rgba(255,255,255,0.72)' }}
    >
      <Text color="#0a0a0c" fontWeight="600" fontSize={15}>
        {children}
      </Text>
    </Button>
  )
}

/** Transparent outline button with a white label. */
export function Ghost({
  children,
  onPress,
  size = '$4',
}: {
  children: string
  onPress: () => void
  size?: ButtonSize
}) {
  return (
    <Button
      size={size}
      onPress={onPress}
      backgroundColor="transparent"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.3)"
      borderRadius={0}
      hoverStyle={{ borderColor: 'rgba(255,255,255,0.7)' }}
    >
      <Text color="#ffffff" fontSize={14}>
        {children}
      </Text>
    </Button>
  )
}

/** Chromeless text button with a muted (or tinted) label. */
export function Plain({
  children,
  onPress,
  size = '$3',
  tone = 'rgba(255,255,255,0.7)',
}: {
  children: string
  onPress: () => void
  size?: ButtonSize
  tone?: string
}) {
  return (
    <Button size={size} chromeless onPress={onPress}>
      <Text color={tone} fontSize={13}>
        {children}
      </Text>
    </Button>
  )
}

/**
 * A full-bleed cinematic frame: an edge-to-edge cover image under a soft dark
 * wash. Callers overlay their own captions/titles as children. `src` falls back
 * to a bundled frame so it is never blank.
 */
export function FullBleed({
  src,
  height = '100vh',
  minHeight = 480,
  dim = 0.26,
  children,
}: {
  src?: string
  height?: number | string
  minHeight?: number | string
  dim?: number
  children?: ReactNode
}) {
  return (
    <YStack
      position="relative"
      width="100%"
      height={height}
      minHeight={minHeight}
      overflow="hidden"
      backgroundColor="#050506"
    >
      <Image
        src={src || FALLBACK_COVER}
        objectFit="cover"
        objectPosition="center"
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor={`rgba(4,4,6,${dim})`}
      />
      {children}
    </YStack>
  )
}

/** A labelled text field for the builder. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const style = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.14)',
    color: '#f4f4f5',
  } as const
  return (
    <YStack gap={7}>
      <Caps fontSize={11} color="rgba(255,255,255,0.4)">
        {label}
      </Caps>
      {multiline ? (
        <TextArea value={value} onChangeText={onChangeText} placeholder={placeholder} minHeight={96} {...style} />
      ) : (
        <Input value={value} onChangeText={onChangeText} placeholder={placeholder} {...style} />
      )}
    </YStack>
  )
}
