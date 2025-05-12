export declare function getValuation(symbol: string): Promise<{
    symbol: string;
    marketRiskPremium: number | null;
    costOfEquity: number | null;
    costOfDebt: number | null;
    wacc: number | null;
    valuation: {
        method: string;
        valueMin: number;
        valueMax: number;
        selected: number;
        upside: number;
    }[];
}>;
export declare function getWaccAndRoicV3(symbol: string): Promise<{
    symbol: string;
    marketCapMil: number | null;
    bookValueDebtMil: number | null;
    weightEquity: number | null;
    weightDebt: number | null;
    taxRate: number | null;
    costOfEquity: number | null;
    riskFreeRate: number | null;
    beta: number | null;
    marketPremium: number | null;
    costOfDebt: number | null;
    interestExpense: number | null;
    totalDebt: number | null;
    wacc: number | null;
    roic: number | null;
}>;
