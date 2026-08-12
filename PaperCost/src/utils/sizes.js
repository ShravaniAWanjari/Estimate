export const STANDARD_SIZES = {
  A3: [0.420, 0.297],
  A4: [0.297, 0.210],
  A5: [0.210, 0.148],
  A6: [0.148, 0.105],
  B4: [0.353, 0.250],
  B5: [0.250, 0.176],
  Letter: [0.279, 0.216],
  Custom: null,
};

export function getArea(sizeKey, customW, customH) {
  if (sizeKey === 'Custom') {
    if (!customW || !customH) return null;
    return (customW / 100) * (customH / 100);
  }
  const dims = STANDARD_SIZES[sizeKey];
  if (!dims) return null;
  return dims[0] * dims[1];
}
