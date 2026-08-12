export function calcPaperCost({ gsm, area, pricePerKg, sheets }) {
  const sheetWeightKg = (gsm * area) / 1000;
  return sheetWeightKg * sheets * pricePerKg;
}

export function calcTotalPerCopy({ paperCost, printCost, bindCost }) {
  return paperCost + (printCost || 0) + (bindCost || 0);
}

export function calcBulkTotal(totalPerCopy, qty) {
  return totalPerCopy * qty;
}
