export interface GuruWACCModel {
    wacc: number;
    roic: number;
    symbol: string;
    weightEquity: number;
    weightDebt: number;
    taxRate: number;
    costOfEquity: number;
    riskFreeRate: number;
    beta: number;
    marketPremium: number;
    costOfDebt: number;
    interestExpense: number;
    totalDebt: number;
    marketCapMil: number;
    bookValueDebtMil: number;
}
