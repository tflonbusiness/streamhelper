export const MEDIA_INTERACTIVE_DEFAULTS = {
  volume: 80,
  showVideo: false,
  overlayWidth: 640,
  overlayHeight: 360,
  audioOverlayWidth: 400,
  backupCutover: 'immediate' as const,
  maxViewerTrackDurationSeconds: 600,
  kickRewardIds: [] as string[],
};

export type MediaInteractiveBackupCutover =
  | 'immediate'
  | 'finish_current_track';
