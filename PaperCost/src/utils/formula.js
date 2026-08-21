/**
 * Calculate per sheet paper cost:
 * ((width_in * height_in * GSM * priceperkg) / 3100) / 500
 */
export function calcPerSheetCost({ areaSqInches, gsm, pricePerKg }) {
  if (!areaSqInches || !gsm || !pricePerKg) return 0;
  return ((areaSqInches * gsm * pricePerKg) / 3100) / 500;
}

/**
 * Calculate paper cost:
 * noOfSheets * perSheetCost
 */
export function calcPaperCost({ noOfSheets, perSheetCost }) {
  return (noOfSheets || 0) * (perSheetCost || 0);
}

/**
 * Calculate lamination cost:
 * ((sheet area * 0.5) / 100) * noOfSheets
 */
export function calcLaminationCost({ areaSqInches, noOfSheets }) {
  if (!areaSqInches || !noOfSheets) return 0;
  return ((areaSqInches * 0.5) / 100) * noOfSheets;
}

/**
 * Calculate total cost:
 * (noOfSheets * perSheetCost) + printCost + bindCost + laminationCost
 */
export function calcTotalCost({ paperCost, printCost, bindCost, laminationCost }) {
  return (paperCost || 0) + (printCost || 0) + (bindCost || 0) + (laminationCost || 0);
}
