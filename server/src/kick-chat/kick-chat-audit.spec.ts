import { describe, expect, it } from 'vitest';
import { describeIntakePersistence } from './kick-chat-audit.js';

describe('describeIntakePersistence', () => {
  it('describes early intake stop', () => {
    const line = describeIntakePersistence(
      { action: 'ignored', reason: 'unknown_channel' },
      { messageId: 'm-1' },
    );
    expect(line).toContain('kick_chat_events not saved');
    expect(line).toContain('unknown_channel');
  });

  it('describes saved participant', () => {
    const line = describeIntakePersistence(
      {
        action: 'participant_added',
        displayName: 'alice',
        replyInChat: false,
      },
      { messageId: 'm-2', chatRollId: 9, participantId: 42 },
    );
    expect(line).toContain('saved participant');
    expect(line).toContain('participantId=42');
  });
});
