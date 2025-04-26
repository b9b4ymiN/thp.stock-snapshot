export interface StockOverview {
    price: number;
    marketCap: string;
    revenue: string;
    netIncome: string;
    eps: string;
    peRatio: string;
    dividend: string;
    exDividendDate: string;
    earningsDate: string;
    range52Week: string;
    performance1Y: string;
}
export declare function getStockOverview(symbol: string): Promise<StockOverview | null>;
