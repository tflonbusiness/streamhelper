const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function extractYoutubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return VIDEO_ID_RE.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id && VIDEO_ID_RE.test(id) ? id : null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2] ?? '';
        return VIDEO_ID_RE.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function extractPlaylistId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    const list = url.searchParams.get('list');
    return list && list.startsWith('PL') ? list : null;
  } catch {
    return null;
  }
}
