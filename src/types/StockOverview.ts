export interface StockOverview {
  price: number; // ราคาล่าสุด
  marketCap: string; // มูลค่าตลาด (รวมหน่วย เช่น B,M)
  revenue: string; // รายได้ (รวมหน่วย เช่น B,M)
  netIncome: string; // กำไรสุทธิ (รวมหน่วย เช่น B,M)
  eps: number; // กำไรต่อหุ้น (จำนวนจริง)
  peRatio: number; // ค่า PE (จำนวนจริง)
  dividend: string; // เงินปันผลและ Dividend Yield รวมอยู่ใน string เดียว
  exDividendDate: string; // วัน XD
  earningsDate: string; // วันประกาศงบ (อาจว่างได้)
  // range52Week is kept for backward compatibility (raw string)
  range52Week: string; // ช่วงราคาสูงต่ำ 52 สัปดาห์ เช่น "34.00 - 67.50"
  low52Week?: number; // ค่าต่ำสุดใน 52 สัปดาห์ (เช่น 169.21)
  high52Week?: number; // ค่าสูงสุดใน 52 สัปดาห์ (เช่น 260.10)
  performance1Y: string; // ผลตอบแทนในรอบ 1 ปี เช่น "-42.86%"
  sharesOutstanding: string; // จำนวนหุ้น (อาจรวมหน่วย เช่น B)
  forwardPERatio?: number; // Forward PE (เช่น 33.39)
  volume?: number; // ปริมาณการซื้อขายปัจจุบัน (เช่น 49149679)
  open?: number; // ราคาเปิด
  previousClose?: number; // ราคาปิดก่อนหน้า
  daysRange?: string; // ช่วงราคาวัน (เช่น "253.95 - 259.24")
  beta?: number; // Beta (เช่น 1.09)
  analysts: string; // คำแนะนำนักวิเคราะห์ (เช่น "Buy")
  priceTarget: string; // ราคาเป้าหมาย (raw string, e.g., "247.65 (-4.02%)")
  priceTargetPrice?: number; // ตัวเลขราคาเป้าหมาย (เช่น 247.65)
  upsidePercent?: number; // Upside เป็นเปอร์เซ็นต์ (เช่น -4.02)
}
