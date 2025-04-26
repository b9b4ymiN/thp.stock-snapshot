import { FinancialPeriodType, FinancialStatement, StatementType } from "./types/FinancialStatement";
import { StockStatistics } from "./types/StockStatistics";
import { StockOverview } from "./types/StockOverview";
export type Market = "bkk" | "us";
export declare function detectMarket(symbol: string): Market;
export declare function getStockOverview(rawSymbol: string): Promise<StockOverview>;
export declare function getStockFinancials(rawSymbol: string, statementType?: StatementType, periodType?: FinancialPeriodType): Promise<FinancialStatement>;
export declare function getStockStatistics(rawSymbol: string): Promise<StockStatistics>;
