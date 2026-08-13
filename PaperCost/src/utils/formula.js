export function calcPaperCost({ gsm, area, pricePerKg, sheets }) {
  const sheetWeightKg = (gsm * area) / 1000;
  return sheetWeightKg * sheets * pricePerKg;
}

export function calcTotalPerCopy({ paperCost, printCost, bindCost, laminationCost }) {
  return paperCost + (printCost || 0) + (bindCost || 0) + (laminationCost || 0);
}
