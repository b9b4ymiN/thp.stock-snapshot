// รายชื่อฟิลด์ของ Income Statement
export enum FinancialField {
  OperatingRevenue = "Operating Revenue",
  OtherRevenue = "Other Revenue",
  Revenue = "Revenue",
  RevenueGrowth = "Revenue Growth (YoY)",
  CostOfRevenue = "Cost of Revenue",
  GrossProfit = "Gross Profit",
  SellingGeneralAdmin = "Selling, General & Admin",
  OtherOperatingExpenses = "Other Operating Expenses",
  OperatingExpenses = "Operating Expenses",
  OperatingIncome = "Operating Income",
  InterestExpense = "Interest Expense",
  InterestInvestmentIncome = "Interest & Investment Income",
  EarningsFromEquityInvestments = "Earnings From Equity Investments",
  CurrencyExchangeGainLoss = "Currency Exchange Gain (Loss)",
  OtherNonOperatingIncomeExpenses = "Other Non Operating Income (Expenses)",
  EBTExcludingUnusualItems = "EBT Excluding Unusual Items",
  GainLossOnSaleOfAssets = "Gain (Loss) on Sale of Assets",
  AssetWritedown = "Asset Writedown",
  PretaxIncome = "Pretax Income",
  IncomeTaxExpense = "Income Tax Expense",
  EarningsFromContinuingOperations = "Earnings From Continuing Operations",
  MinorityInterestInEarnings = "Minority Interest in Earnings",
  NetIncome = "Net Income",
  NetIncomeToCommon = "Net Income to Common",
  NetIncomeGrowth = "Net Income Growth",
  SharesOutstandingBasic = "Shares Outstanding (Basic)",
  SharesOutstandingDiluted = "Shares Outstanding (Diluted)",
  EPSBasic = "EPS (Basic)",
  EPSDiluted = "EPS (Diluted)",
  EPSGrowth = "EPS Growth",
  FreeCashFlow = "Free Cash Flow",
  FreeCashFlowPerShare = "Free Cash Flow Per Share",
  DividendPerShare = "Dividend Per Share",
  DividendGrowth = "Dividend Growth",
  GrossMargin = "Gross Margin",
  OperatingMargin = "Operating Margin",
  ProfitMargin = "Profit Margin",
  FreeCashFlowMargin = "Free Cash Flow Margin",
  EBITDA = "EBITDA",
  EBITDAMargin = "EBITDA Margin",
  DAForEBITDA = "D&A For EBITDA",
  EBIT = "EBIT",
  EBITMargin = "EBIT Margin",
  EffectiveTaxRate = "Effective Tax Rate",
  RevenueAsReported = "Revenue as Reported",
}

// Type สำหรับข้อมูล Financial (Income)
export interface FinancialData {
  fiscalYear: string[];
  periodEnding: string[];
  statementType: "Income";
  periodType: "Annual" | "Quarterly" | "TTM";
  unit: "Millions" | "Billions" | "Thousands" | "Trillions";
  financials: Record<FinancialField, (number | null)[]>;
}
