// Standard sizes stored in metres (length × width)
// Dimensions shown to user in inches
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

// Convert metres to inches for display
function metresToInches(m) {
  return (m * 39.3701).toFixed(2);
}

// Get display string for a size (in inches)
export function getSizeDisplay(sizeKey) {
  const dims = STANDARD_SIZES[sizeKey];
  if (!dims) return sizeKey;
  return `${metresToInches(dims[0])}″ × ${metresToInches(dims[1])}″`;
}

// Get paper area in m² (used for cost formula)
export function getArea(sizeKey, customW, customH) {
  if (sizeKey === 'Custom') {
    if (!customW || !customH) return null;
    // Custom dimensions entered in inches → convert to metres
    return (customW * 0.0254) * (customH * 0.0254);
  }
  const dims = STANDARD_SIZES[sizeKey];
  if (!dims) return null;
  return dims[0] * dims[1];
}

// Get paper dimensions in inches (for lamination calc)
export function getDimensionsInches(sizeKey, customW, customH) {
  if (sizeKey === 'Custom') {
    return { w: customW || 0, h: customH || 0 };
  }
  const dims = STANDARD_SIZES[sizeKey];
  if (!dims) return { w: 0, h: 0 };
  return {
    w: parseFloat(metresToInches(dims[0])),
    h: parseFloat(metresToInches(dims[1])),
  };
}
