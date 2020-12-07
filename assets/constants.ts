// IDs that should have the SYSTEM tag with their messages.
export const SYSTEM_USER_IDS = [
  // Community Updates
  '768235830069166151',
];

// IDs that shouldn't be fetched while caching uncached members.
export const UNCACHEABLE_IDS = [...SYSTEM_USER_IDS];

export const proxyURL = (url: string) => {
  return (
    'https://external-content.duckduckgo.com/iu/?u=' +
    encodeURIComponent(url) +
    '&f=1'
  );
};

export const clampSize = (clamp: number, w: number, h: number) => {
  if (w <= clamp && h <= clamp) return [w, h];
  const taller = w < h;
  const ratio = taller ? h / w : w / h;
  const newDimension = clamp / ratio;
  return taller ? [newDimension, clamp] : [clamp, newDimension];
};
