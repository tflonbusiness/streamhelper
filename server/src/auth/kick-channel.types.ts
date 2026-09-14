export type KickChannelDto = {
  slug: string;
  streamTitle: string | null;
  channelDescription: string | null;
  bannerPicture: string | null;
  categoryName: string | null;
  isLive: boolean;
  isMature: boolean;
  viewerCount: number | null;
  streamThumbnail: string | null;
  activeSubscribersCount: number | null;
  activeGiftedSubscribersCount: number | null;
};
