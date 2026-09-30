/** Broadcast status for a newly created account module session (one live per module per account). */
export type AccountModuleSessionStatus = 'live' | 'off_air';

/** When no other session in the same module is live, the new session starts live. */
export function initialSessionStatusOnCreate(
  accountHasLiveSession: boolean,
): AccountModuleSessionStatus {
  return accountHasLiveSession ? 'off_air' : 'live';
}
