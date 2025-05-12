export interface valuationTableModel {
  symbol: string;
  marketRiskPremium: number;
  costOfEquity: number;
  costOfDebt: number;
  wacc: number;
  valuation: valuationDetail[];
}

export interface valuationDetail {
  method: string;
  valueMin: number;
  valueMax: number;
  selected: number;
  upside: number;
}
