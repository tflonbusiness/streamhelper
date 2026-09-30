const BADGE_TYPE_TO_ROLE: Record<string, string> = {
  moderator: 'moderator',
  vip: 'vip',
  og: 'og',
  subscriber: 'paid_subscriber',
  sub: 'paid_subscriber',
  founder: 'og',
};

export function mapKickBadgesToRoleIds(
  badges: { type?: string; text?: string }[] | undefined,
): string[] {
  if (!badges?.length) {
    return [];
  }

  const roleIds = new Set<string>();

  for (const badge of badges) {
    const typeKey = badge.type?.trim().toLowerCase();
    if (typeKey && BADGE_TYPE_TO_ROLE[typeKey]) {
      roleIds.add(BADGE_TYPE_TO_ROLE[typeKey]);
      continue;
    }

    const textKey = badge.text?.trim().toLowerCase();
    if (textKey?.includes('mod')) {
      roleIds.add('moderator');
    } else if (textKey?.includes('sub')) {
      roleIds.add('paid_subscriber');
    } else if (textKey?.includes('vip')) {
      roleIds.add('vip');
    } else if (textKey?.includes('og')) {
      roleIds.add('og');
    }
  }

  return [...roleIds];
}

/** Kick chat roles: badge-derived roles plus viewer for every chatter. */
export function resolveKickChatRollRoleIds(
  badges: { type?: string; text?: string }[] | undefined,
): string[] {
  const fromBadges = mapKickBadgesToRoleIds(badges);
  return [...new Set([...fromBadges, 'viewer'])];
}
