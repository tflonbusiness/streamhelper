import { describe, expect, it } from 'vitest';
import { extractYoutubeVideoId, normalizeYoutubeWatchUrl } from './youtube-url.js';

describe('youtube-url', () => {
  it('parses watch URLs', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('parses youtu.be URLs', () => {
    expect(extractYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('normalizes watch url', () => {
    expect(normalizeYoutubeWatchUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });
});
