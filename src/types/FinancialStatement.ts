export type FinancialPeriodType = "Annual" | "Quarterly" | "TTM";
export type StatementType = "Income" | "Balance Sheet" | "Cash Flow" | "Ratios";

export interface FinancialStatementBase {
  fiscalYear: string[];
  periodEnding: string[];
  statementType: StatementType;
  periodType: FinancialPeriodType;
  unit: string;
}
// 1. Base Type ที่มี fiscalYear, quarter, year ให้ทุกตัว
export interface BaseFinancialRow {
  fiscalYear: string; // เช่น "FY 2024" หรือ "Q2 2024"
  quarter: "Q1" | "Q2" | "Q3" | "Q4" | "ALL"; // ถ้า FY -> ALL
  year: string; // ปี เช่น "2024"
}
// ---------------- Income Statement ----------------
export interface IncomeStatement extends FinancialStatementBase {
  statementType: "Income";
  financials: {
    "Operating Revenue": (number | null)[];
    "Other Revenue": (number | null)[];
    Revenue: (number | null)[];
    "Revenue Growth (YoY)": (number | null)[];
    "Cost of Revenue": (number | null)[];
    "Gross Profit": (number | null)[];
    "Selling, General & Admin": (number | null)[];
    "Other Operating Expenses": (number | null)[];
    "Operating Expenses": (number | null)[];
    "Operating Income": (number | null)[];
    "Interest Expense": (number | null)[];
    "Interest & Investment Income": (number | null)[];
    "Earnings From Equity Investments": (number | null)[];
    "Currency Exchange Gain (Loss)": (number | null)[];
    "Other Non Operating Income (Expenses)": (number | null)[];
    "EBT Excluding Unusual Items": (number | null)[];
    "Gain (Loss) on Sale of Assets": (number | null)[];
    "Asset Writedown": (number | null)[];
    "Pretax Income": (number | null)[];
    "Income Tax Expense": (number | null)[];
    "Earnings From Continuing Operations": (number | null)[];
    "Minority Interest in Earnings": (number | null)[];
    "Net Income": (number | null)[];
    "Net Income to Common": (number | null)[];
    "Net Income Growth": (number | null)[];
    "Shares Outstanding (Basic)": (number | null)[];
    "Shares Outstanding (Diluted)": (number | null)[];
    "EPS (Basic)": (number | null)[];
    "EPS (Diluted)": (number | null)[];
    "EPS Growth": (number | null)[];
    "Free Cash Flow": (number | null)[];
    "Free Cash Flow Per Share": (number | null)[];
    "Dividend Per Share": (number | null)[];
    "Dividend Growth": (number | null)[];
    "Gross Margin": (number | null)[];
    "Operating Margin": (number | null)[];
    "Profit Margin": (number | null)[];
    "Free Cash Flow Margin": (number | null)[];
    EBITDA: (number | null)[];
    "EBITDA Margin": (number | null)[];
    "D&A For EBITDA": (number | null)[];
    EBIT: (number | null)[];
    "EBIT Margin": (number | null)[];
    "Effective Tax Rate": (number | null)[];
    "Revenue as Reported": (number | null)[];
  };
}
export interface IncomeStatementV2 extends BaseFinancialRow {
  revenue: number | null;
  operatingRevenue?: number | null;
  otherRevenue?: number | null;
  revenueGrowthYoY?: number | null;
  costOfRevenue?: number | null;
  grossProfit?: number | null;
  operatingIncome?: number | null;
  netIncome?: number | null;
  epsBasic?: number | null;
  epsDiluted?: number | null;
  freeCashFlow?: number | null;
  dividendPerShare?: number | null;
  grossMargin?: number | null;
  operatingMargin?: number | null;
  profitMargin?: number | null;
  fcfMargin?: number | null;
  ebitda?: number | null;
  ebitdaMargin?: number | null;
}

// ---------------- Balance Sheet ----------------
export interface BalanceSheetStatement extends FinancialStatementBase {
  statementType: "Balance Sheet";
  financials: {
    "Cash & Equivalents": (number | null)[];
    "Short-Term Investments": (number | null)[];
    "Cash & Short-Term Investments": (number | null)[];
    "Cash Growth": (number | null)[];
    "Accounts Receivable": (number | null)[];
    "Other Receivables": (number | null)[];
    Receivables: (number | null)[];
    Inventory: (number | null)[];
    "Prepaid Expenses": (number | null)[];
    "Other Current Assets": (number | null)[];
    "Total Current Assets": (number | null)[];
    "Property, Plant & Equipment": (number | null)[];
    "Long-Term Investments": (number | null)[];
    "Other Intangible Assets": (number | null)[];
    "Long-Term Accounts Receivable": (number | null)[];
    "Long-Term Deferred Tax Assets": (number | null)[];
    "Other Long-Term Assets": (number | null)[];
    "Total Assets": (number | null)[];
    "Accounts Payable": (number | null)[];
    "Accrued Expenses": (number | null)[];
    "Short-Term Debt": (number | null)[];
    "Current Portion of Long-Term Debt": (number | null)[];
    "Current Portion of Leases": (number | null)[];
    "Current Income Taxes Payable": (number | null)[];
    "Current Unearned Revenue": (number | null)[];
    "Other Current Liabilities": (number | null)[];
    "Total Current Liabilities": (number | null)[];
    "Long-Term Debt": (number | null)[];
    "Long-Term Leases": (number | null)[];
    "Long-Term Unearned Revenue": (number | null)[];
    "Other Long-Term Liabilities": (number | null)[];
    "Total Liabilities": (number | null)[];
    "Common Stock": (number | null)[];
    "Additional Paid-In Capital": (number | null)[];
    "Retained Earnings": (number | null)[];
    "Comprehensive Income & Other": (number | null)[];
    "Total Common Equity": (number | null)[];
    "Minority Interest": (number | null)[];
    "Shareholders' Equity": (number | null)[];
    "Total Liabilities & Equity": (number | null)[];
    "Total Debt": (number | null)[];
    "Net Cash (Debt)": (number | null)[];
    "Net Cash Growth": (number | null)[];
    "Net Cash Per Share": (number | null)[];
    "Filing Date Shares Outstanding": (number | null)[];
    "Total Common Shares Outstanding": (number | null)[];
    "Working Capital": (number | null)[];
    "Book Value Per Share": (number | null)[];
    "Tangible Book Value": (number | null)[];
    "Tangible Book Value Per Share": (number | null)[];
    Land: (number | null)[];
    Buildings: (number | null)[];
    Machinery: (number | null)[];
    "Construction In Progress": (number | null)[];
  };
}
export interface BalanceSheetStatementV2 extends BaseFinancialRow {
  cashAndEquivalents?: number | null;
  shortTermInvestments?: number | null;
  totalAssets?: number | null;
  totalLiabilities?: number | null;
  totalDebt?: number | null;
  netCash?: number | null;
  netCashPerShare?: number | null;
  bookValue?: number | null;
  bookValuePerShare?: number | null;
  workingCapital?: number | null;
  tangibleBookValue?: number | null;
  tangibleBookValuePerShare?: number | null;
}

// ---------------- Cash Flow Statement ----------------
export interface CashFlowStatement extends FinancialStatementBase {
  statementType: "Cash Flow";
  financials: {
    "Net Income": (number | null)[];
    "Depreciation & Amortization": (number | null)[];
    "Loss (Gain) From Sale of Assets": (number | null)[];
    "Asset Writedown & Restructuring Costs": (number | null)[];
    "Loss (Gain) on Equity Investments": (number | null)[];
    "Provision & Write-off of Bad Debts": (number | null)[];
    "Other Operating Activities": (number | null)[];
    "Change in Accounts Receivable": (number | null)[];
    "Change in Inventory": (number | null)[];
    "Change in Accounts Payable": (number | null)[];
    "Change in Other Net Operating Assets": (number | null)[];
    "Operating Cash Flow": (number | null)[];
    "Operating Cash Flow Growth": (number | null)[];
    "Capital Expenditures": (number | null)[];
    "Sale of Property, Plant & Equipment": (number | null)[];
    "Sale (Purchase) of Intangibles": (number | null)[];
    "Investment in Securities": (number | null)[];
    "Other Investing Activities": (number | null)[];
    "Investing Cash Flow": (number | null)[];
    "Short-Term Debt Issued": (number | null)[];
    "Long-Term Debt Issued": (number | null)[];
    "Total Debt Issued": (number | null)[];
    "Short-Term Debt Repaid": (number | null)[];
    "Long-Term Debt Repaid": (number | null)[];
    "Total Debt Repaid": (number | null)[];
    "Net Debt Issued (Repaid)": (number | null)[];
    "Common Dividends Paid": (number | null)[];
    "Other Financing Activities": (number | null)[];
    "Financing Cash Flow": (number | null)[];
    "Net Cash Flow": (number | null)[];
    "Free Cash Flow": (number | null)[];
    "Free Cash Flow Growth": (number | null)[];
    "Free Cash Flow Margin": (number | null)[];
    "Free Cash Flow Per Share": (number | null)[];
    "Cash Interest Paid": (number | null)[];
    "Cash Income Tax Paid": (number | null)[];
    "Levered Free Cash Flow": (number | null)[];
    "Unlevered Free Cash Flow": (number | null)[];
    "Change in Net Working Capital": (number | null)[];
  };
}
export interface CashFlowStatementV2 extends BaseFinancialRow {
  operatingCashFlow?: number | null;
  investingCashFlow?: number | null;
  financingCashFlow?: number | null;
  freeCashFlow?: number | null;
  capitalExpenditures?: number | null;
  cashInterestPaid?: number | null;
  cashIncomeTaxPaid?: number | null;
  leveredFreeCashFlow?: number | null;
  unleveredFreeCashFlow?: number | null;
}
// ---------------- Ratios ----------------
export interface RatiosStatement extends FinancialStatementBase {
  statementType: "Ratios";
  financials: {
    "Market Capitalization": (number | null)[];
    "Market Cap Growth": (number | null)[];
    "Enterprise Value": (number | null)[];
    "Last Close Price": (number | null)[];
    "PE Ratio": (number | null)[];
    "Forward PE": (number | null)[];
    "PS Ratio": (number | null)[];
    "PB Ratio": (number | null)[];
    "P/TBV Ratio": (number | null)[];
    "P/FCF Ratio": (number | null)[];
    "P/OCF Ratio": (number | null)[];
    "PEG Ratio": (number | null)[];
    "EV/Sales Ratio": (number | null)[];
    "EV/EBITDA Ratio": (number | null)[];
    "EV/EBIT Ratio": (number | null)[];
    "EV/FCF Ratio": (number | null)[];
    "Debt / Equity Ratio": (number | null)[];
    "Debt / EBITDA Ratio": (number | null)[];
    "Debt / FCF Ratio": (number | null)[];
    "Asset Turnover": (number | null)[];
    "Inventory Turnover": (number | null)[];
    "Quick Ratio": (number | null)[];
    "Current Ratio": (number | null)[];
    "Return on Equity (ROE)": (number | null)[];
    "Return on Assets (ROA)": (number | null)[];
    "Return on Capital (ROIC)": (number | null)[];
    "Return on Capital Employed (ROCE)": (number | null)[];
    "Earnings Yield": (number | null)[];
    "FCF Yield": (number | null)[];
    "Dividend Yield": (number | null)[];
    "Payout Ratio": (number | null)[];
    "Total Shareholder Return": (number | null)[];
  };
}
export interface RatiosStatementV2 extends BaseFinancialRow {
  peRatio?: number | null;
  forwardPERatio?: number | null;
  psRatio?: number | null;
  pbRatio?: number | null;
  ptbvRatio?: number | null;
  pfcfRatio?: number | null;
  pocfRatio?: number | null;
  pegRatio?: number | null;
  evSales?: number | null;
  evEbitda?: number | null;
  evEarnings?: number | null;
  evFcf?: number | null;
  debtToEquity?: number | null;
  currentRatio?: number | null;
  quickRatio?: number | null;
  returnOnEquity?: number | null;
  returnOnAssets?: number | null;
  returnOnInvestedCapital?: number | null;
  dividendYield?: number | null;
  fcfYield?: number | null;
  earningsYield?: number | null;
}
// ---------------- รวมทุก Statement ----------------
export type FinancialStatement =
  | IncomeStatement
  | BalanceSheetStatement
  | CashFlowStatement
  | RatiosStatement;

// types/FinancialStatement.ts

export type FinancialVariable =
  | "Revenue"
  | "Net Income"
  | "EBITDA"
  | "Operating Income"
  | "EPS"
  | "Free Cash Flow"
  | "Gross Margin"
  | "Operating Margin"
  | "Profit Margin"
  | "Pretax Income"
  | "Total Assets"
  | "Total Liabilities"
  | "Book Value Per Share"
  | "Debt / Equity"
  | "Return on Equity (ROE)"
  | "Return on Assets (ROA)"
  | "Cash & Cash Equivalents"
  | "Dividend Per Share"
  | "Dividend Yield"
  | "Shares Outstanding"
  | "Earnings Yield"
  | "FCF Yield"
  | "Operating Cash Flow"
  | "Capital Expenditures"
  | "Pretax Margin"
  | "EBIT"
  | "EBITDA Margin"
  | "EBIT Margin"
  | "Payout Ratio"
  | "PEG Ratio"
  | "PE Ratio"
  | "PS Ratio"
  | "PB Ratio"
  | "P/FCF Ratio"
  | "P/OCF Ratio"
  | "Altman Z-Score"
  | "Piotroski F-Score"
  | "Interest Coverage"
  | "Debt / EBITDA"
  | "Debt / FCF"
  | "Beta (5Y)"
  | "52-Week Price Change"
  | "50-Day Moving Average"
  | "200-Day Moving Average"
  | "Relative Strength Index (RSI)"
  | "Average Volume (20 Days)"
  | "Market Cap"
  | "Enterprise Value"
  | "Book Value"
  | "Net Cash"
  | "Net Cash Per Share"
  | "Total Debt"
  | "Working Capital"
  | "Revenue as Reported"
  | "Dividend Growth (YoY)"
  | "Shareholder Yield"
  | "Buyback Yield";

export interface FinancialStatementV2 {
  fiscalYear: string; // เช่น "FY 2024" หรือ "Q2 2023"
  quarter: string; // เช่น "ALL" หรือ "Q1" "Q2" "Q3" "Q4"
  year: string; // เช่น "2024"
  periodEnding: string; // เช่น "Sep 30, 2024"
  periodType: "Annual" | "Quarterly" | "TTM";
  statementType: "Income" | "Balance Sheet" | "Cash Flow" | "Ratios";
  unit: string; // "Millions", "Billions", etc.
  // Financial Variables แบบแบนราบ (Flat)
  [key: string]: string | number | null;
}
