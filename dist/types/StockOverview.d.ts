export interface StockOverview {
    price: number;
    marketCap: string;
    revenue: string;
    netIncome: string;
    eps: number;
    peRatio: number;
    dividend: string;
    exDividendDate: string;
    earningsDate: string;
    range52Week: string;
    low52Week?: number;
    high52Week?: number;
    performance1Y: string;
    sharesOutstanding: string;
    forwardPERatio?: number;
    volume?: number;
    open?: number;
    previousClose?: number;
    daysRange?: string;
    beta?: number;
    analysts: string;
    priceTarget: string;
    priceTargetPrice?: number;
    upsidePercent?: number;
}
