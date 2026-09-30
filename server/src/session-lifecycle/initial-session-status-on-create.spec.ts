import { describe, expect, it } from 'vitest';
import { initialSessionStatusOnCreate } from './initial-session-status-on-create.js';

describe('initialSessionStatusOnCreate', () => {
  it('starts live when no other live session exists', () => {
    expect(initialSessionStatusOnCreate(false)).toBe('live');
  });

  it('starts off air when another session is already live', () => {
    expect(initialSessionStatusOnCreate(true)).toBe('off_air');
  });
});
