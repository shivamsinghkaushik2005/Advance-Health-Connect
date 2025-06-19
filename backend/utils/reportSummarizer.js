export function extractHealthParameters(text) {
  const summary = {};

  const patterns = {
    bloodPressure: /blood\s*pressure[:\s]*([\d]{2,3}\/[\d]{2,3})/i,
    bloodSugar: /(blood\s*sugar|glucose)[^\d]*(\d{2,3})/i,
    hemoglobin: /hemoglobin[^\d]*(\d{1,2}\.?\d*)/i,
    cholesterol: /cholesterol[^\d]*(\d{2,3})/i,
    rbc: /rbc[^\d]*(\d{1,2}\.?\d*)/i,
    wbc: /wbc[^\d]*(\d{1,5})/i,
    platelets: /platelets?[^\d]*(\d{1,6})/i,
    uricAcid: /uric\s*acid[^\d]*(\d{1,2}\.?\d*)/i,
    creatinine: /creatinine[^\d]*(\d{1,2}\.?\d*)/i,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    summary[key] = match ? match[1] : 'Not Found';
  }

  return summary;
}