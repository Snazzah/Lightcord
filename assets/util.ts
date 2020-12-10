export const proxyURL = (url: string) => {
  return (
    'https://external-content.duckduckgo.com/iu/?u=' +
    encodeURIComponent(url) +
    '&f=1'
  );
};

export const clampSize = (clamp: number, w: number, h: number) => {
  if (w <= clamp && h <= clamp) return [w, h];
  clamp = Math.round(clamp);
  const taller = w < h;
  const ratio = taller ? h / w : w / h;
  const newDimension = Math.round(clamp / ratio);
  return taller ? [newDimension, clamp] : [clamp, newDimension];
};

export const getRatio = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) => {
  let initialRatio = 1;
  if (width > maxWidth) initialRatio = maxWidth / width;
  // width = Math.round(width * initialRatio);
  height = Math.round(height * initialRatio);
  let heightRatio = 1;
  if (height > maxHeight) heightRatio = maxHeight / height;
  return Math.min(initialRatio * heightRatio, 1);
};
