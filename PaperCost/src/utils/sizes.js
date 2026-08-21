// Standard sizes stored in inches (width × height)
export const STANDARD_SIZES = {
  '18 × 23': [18, 23],
  '20 × 30': [20, 30],
  '23 × 36': [23, 36],
  A4: [8.27, 11.69],
  A3: [11.69, 16.54],
  A5: [5.83, 8.27],
  Letter: [8.5, 11.0],
  Custom: null,
};

// Get display string for a size (in inches)
export function getSizeDisplay(sizeKey) {
  const dims = STANDARD_SIZES[sizeKey];
  if (!dims) return sizeKey;
  return `${dims[0]}″ × ${dims[1]}″`;
}

// Get paper dimensions in inches
export function getDimensionsInches(sizeKey, customW, customH) {
  if (sizeKey === 'Custom') {
    return {
      w: parseFloat(customW) || 0,
      h: parseFloat(customH) || 0,
    };
  }
  const dims = STANDARD_SIZES[sizeKey];
  if (!dims) return { w: 18, h: 23 };
  return {
    w: dims[0],
    h: dims[1],
  };
}

// Get paper area in sq inches
export function getAreaSqInches(sizeKey, customW, customH) {
  const { w, h } = getDimensionsInches(sizeKey, customW, customH);
  if (!w || !h) return 0;
  return w * h;
}
