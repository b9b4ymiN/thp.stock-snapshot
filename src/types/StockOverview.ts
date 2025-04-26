export interface StockOverview {
  price: number; // ราคาล่าสุด
  marketCap: string; // มูลค่าตลาด (รวมหน่วย เช่น B,M)
  revenue: string; // รายได้ (รวมหน่วย เช่น B,M)
  netIncome: string; // กำไรสุทธิ (รวมหน่วย เช่น B,M)
  eps: string; // กำไรต่อหุ้น
  peRatio: string; // ค่า PE
  dividend: string; // เงินปันผลและ Dividend Yield รวมอยู่ใน string เดียว
  exDividendDate: string; // วัน XD
  earningsDate: string; // วันประกาศงบ (อาจว่างได้)
  range52Week: string; // ช่วงราคาสูงต่ำ 52 สัปดาห์ เช่น "34.00 - 67.50"
  performance1Y: string; // ผลตอบแทนในรอบ 1 ปี เช่น "-42.86%"
}
