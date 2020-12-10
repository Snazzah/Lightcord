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

export function numberFormat(
  number: number,
  decimalPlaces = 2,
  decimal = '.',
  separator = ','
) {
  decimalPlaces = isNaN(decimalPlaces) ? 2 : Math.abs(decimalPlaces);
  const sign = number < 0 ? '-' : '';
  number = Math.abs(+number || 0);
  const intString = String(parseInt(number.toFixed(decimalPlaces), 10));
  const separations = intString.length > 3 ? intString.length % 3 : 0;
  return (
    sign +
    (separations ? intString.substr(0, separations) + separator : '') +
    intString.substr(separations).replace(/(\d{3})(?=\d)/g, '$1' + separator) +
    (decimalPlaces
      ? decimal +
        Math.abs(number - parseFloat(intString))
          .toFixed(decimalPlaces)
          .slice(2)
      : '')
  );
}

export function intword(
  number: number,
  suffixes = ['', 'K', 'M', 'B', 'T'],
  base = 1000,
  decimalPlaces = 2,
  decimal = '.',
  separator = ',',
  presuffix = ''
) {
  let power = suffixes.length - 1;
  for (let i = 0; i < suffixes.length; i++)
    if (number < Math.pow(base, i + 1)) {
      power = i;
      break;
    }
  const size = number / Math.pow(base, power);
  const suffix = suffixes[power] ? presuffix + suffixes[power] : '';
  return numberFormat(size, decimalPlaces, decimal, separator) + suffix;
}

export function filesize(
  size: number,
  base = 1024,
  decimalPlaces = 2,
  decimal: '.',
  numberSep: ',',
  separator = ' '
) {
  if (size < base) decimalPlaces = 0;
  return size <= 0
    ? '0 bytes'
    : intword(
        size,
        ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
        base,
        decimalPlaces,
        decimal,
        numberSep,
        separator
      );
}

export function ordinal(number: number) {
  number = parseInt(String(number), 10);
  const sign = (number = isNaN(number) ? 0 : number) < 0 ? '-' : '';
  const i = (number = Math.abs(number)) % 100;
  const ordinals: { [key: number]: string } = {
    1: 'st',
    2: 'nd',
    3: 'rd',
  };
  return (
    sign + number + (i > 4 && i < 21 ? 'th' : ordinals[number % 10] || 'th')
  );
}
