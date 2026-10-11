import {
  extractYoutubeVideoId,
  normalizeYoutubeWatchUrl,
} from './youtube-url.js';

export type YoutubeVideoMetadata = {
  videoId: string;
  title: string;
  durationSeconds: number;
  watchUrl: string;
};

export async function fetchYoutubeVideoMetadata(
  rawUrl: string,
): Promise<YoutubeVideoMetadata | null> {
  const videoId = extractYoutubeVideoId(rawUrl);
  if (!videoId) {
    return null;
  }

  const watchUrl = normalizeYoutubeWatchUrl(videoId);
  let title = `YouTube ${videoId}`;
  let durationSeconds = 0;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`;
    const oembedRes = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'StreamHelper/1.0' },
    });
    if (oembedRes.ok) {
      const data = (await oembedRes.json()) as { title?: string };
      if (data.title) {
        title = data.title;
      }
    }
  } catch {
    // keep fallback title
  }

  try {
    const pageRes = await fetch(watchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
      if (lengthMatch) {
        durationSeconds = Number.parseInt(lengthMatch[1], 10);
      }
    }
  } catch {
    // duration may stay 0
  }

  return { videoId, title, durationSeconds, watchUrl };
}

export async function expandYoutubePlaylistVideoIds(
  playlistUrl: string,
): Promise<string[]> {
  try {
    const url = new URL(playlistUrl.trim());
    const listId = url.searchParams.get('list');
    if (!listId) {
      return [];
    }
    const playlistPage = `https://www.youtube.com/playlist?list=${listId}`;
    const res = await fetch(playlistPage, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) {
      return [];
    }
    const html = await res.text();
    const ids = new Set<string>();
    const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null) {
      ids.add(match[1]);
    }
    return [...ids].slice(0, 50);
  } catch {
    return [];
  }
}
