interface WeChatIconProps {
  size?: number
  className?: string
  frontColor?: string
  backColor?: string
  eyeColor?: string
  style?: React.CSSProperties
}

export function WeChatIcon({
  size = 24,
  className = '',
  frontColor = '#FFFFFF',
  backColor = 'currentColor',
  eyeColor = 'transparent',
  style
}: WeChatIconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
    >
      {/* Background Bubble (Left) - No Eyes */}
      <path
        d="M8.5 3C5.46 3 3 5.24 3 8c0 1.57.82 2.97 2.1 3.9L4.5 14l2.3-1.2c.54.13 1.1.2 1.7.2.28 0 .56-.02.83-.05A5.97 5.97 0 0 1 9 11c0-3.31 2.92-6 6.5-6 .17 0 .34.01.5.02C14.73 3.8 11.83 3 8.5 3Z"
        fill={backColor}
      />
      {/* Foreground Bubble (Right) */}
      <path
        d="M15.5 7C12.46 7 10 9.24 10 12s2.46 5 5.5 5c.57 0 1.12-.08 1.64-.22L19.5 18l-.6-2.05C20.15 14.97 21 13.57 21 12c0-2.76-2.46-5-5.5-5Z"
        fill={frontColor}
      />
      {/* Foreground Bubble Eyes (Cutouts mimicking background) */}
      <circle cx="13" cy="11.5" r="0.7" fill={eyeColor} />
      <circle cx="18" cy="11.5" r="0.7" fill={eyeColor} />
    </svg>
  )
}
