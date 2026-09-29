export type PublicWidgetUnavailableReason =
  | 'no_live_session'
  | 'no_sessions';

export type PublicWidgetUnavailable = {
  status: 'unavailable';
  reason: PublicWidgetUnavailableReason;
};

export type PublicWidgetNotFound = {
  status: 'not_found';
  reason: 'unknown_account';
};
