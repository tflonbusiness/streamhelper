export function youtubeThumbnailUrl(
  videoId: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' = 'mqdefault',
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
}
