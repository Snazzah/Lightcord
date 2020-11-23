// Polyfill Error.captureStackTrace for Firefox
if (!Error.captureStackTrace)
  Error.captureStackTrace = (obj) =>
    Object.assign(obj, { stack: Error().stack });
