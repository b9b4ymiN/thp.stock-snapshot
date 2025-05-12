import { valuationTableModel } from "./types/valuationTableMode";
import { GuruWACCModel } from "./types/GuruWACC";
export declare function getValuation(symbol: string): Promise<valuationTableModel>;
export declare function getWaccAndRoicV3(symbol: string): Promise<GuruWACCModel>;
