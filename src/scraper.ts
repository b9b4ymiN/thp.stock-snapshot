import axios from "axios";
import * as cheerio from "cheerio";
import {
  FinancialPeriodType,
  FinancialStatement,
  FinancialStatementV2,
  IncomeStatement,
  StatementType,
} from "./types/FinancialStatement";
import { StockStatistics } from "./types/StockStatistics";
import { StockOverview } from "./types/StockOverview";
import { json } from "stream/consumers";
import { IncomeStatementType } from "./types/Statement";

export type Market = "bkk" | "us";

function detectMarket(symbol: string): "bkk" | "us" {
  if (/^(BKK:|.+\.BK)$/i.test(symbol)) return "bkk";
  return "us";
}

function cleanSymbol(rawSymbol: string): string {
  return rawSymbol.replace(/^BKK:/, "").replace(/\.BK$/, "").toUpperCase();
}

// ดึงข้อมูล overview (ข้อมูลราคาปัจจุบัน)
export async function getStockOverview(
  rawSymbol: string
): Promise<StockOverview> {
  const market = detectMarket(rawSymbol);
  const symbol = rawSymbol
    .replace(/^BKK:/, "") // ตัด BKK: ออก
    .replace(/\.BK$/, ""); // ตัด .BK ออก

  let url =
    market == "bkk"
      ? `https://stockanalysis.com/quote/bkk/${symbol}/`
      : `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const priceText = $("div.text-4xl.font-bold").first().text();
  const price = parseFloat(priceText.replace(",", ""));

  const findTableText = (label: string) => {
    const table = $('table[data-test="overview-info"]');
    const row = table
      .find("td")
      .filter((i, el) => $(el).text().trim() === label)
      .parent();
    return row.find("td").last().text().trim();
  };

  return {
    price: price || 0,
    marketCap: findTableText("Market Cap") || "",
    revenue: findTableText("Revenue (ttm)") || "",
    netIncome: findTableText("Net Income (ttm)") || "",
    eps: findTableText("EPS (ttm)") || "",
    peRatio: findTableText("PE Ratio") || "",
    dividend: findTableText("Dividend") || "",
    exDividendDate: findTableText("Ex-Dividend Date") || "",
    earningsDate: findTableText("Earnings Date") || "",
    range52Week:
      (() => {
        const table = $('table[data-test="overview-quote"]');
        const row = table
          .find("td")
          .filter((i, el) => $(el).text().trim() === "52-Week Range")
          .parent();
        return row.find("td").last().text().trim();
      })() || "",
    performance1Y:
      (() => {
        const performance = $("div.flex.shrink.flex-row.space-x-1 span")
          .first()
          .text();
        return performance.trim();
      })() || "",
  } as StockOverview;
}

// ดึงข้อมูล financials (งบย้อนหลัง)
export async function getStockFinancials(
  rawSymbol: string,
  statementType: StatementType = "Income",
  periodType: FinancialPeriodType = "Annual"
): Promise<FinancialStatement> {
  const symbol = rawSymbol
    .replace(/^BKK:/, "") // ตัด BKK: ออก
    .replace(/\.BK$/, ""); // ตัด .BK ออก
  const market = detectMarket(rawSymbol);
  let baseUrl =
    market === "bkk"
      ? `https://stockanalysis.com/quote/bkk/${symbol}/`
      : `https://stockanalysis.com/stocks/${symbol}/`;

  let url = `${baseUrl}financials/`;

  if (statementType === "Balance Sheet") {
    url = `${baseUrl}financials/balance-sheet/`;
  } else if (statementType === "Cash Flow") {
    url = `${baseUrl}financials/cash-flow-statement/`;
  } else if (statementType === "Ratios") {
    url = `${baseUrl}financials/ratios/`;
  }

  if (periodType === "Quarterly") {
    url += "?p=quarterly";
  } else if (periodType === "TTM") {
    url += "?p=trailing";
  }

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  // ดึง unit
  const unitRaw = $(".relative.inline-block.text-left").text().trim();
  const unitText = unitRaw
    .replace(/Data Source|Download/g, "")
    .replace(/\s+/g, " ")
    .trim();
  let multiplier = 1;
  if (unitText.includes("Million")) multiplier = 1e6;
  else if (unitText.includes("Billion")) multiplier = 1e9;
  else if (unitText.includes("Thousand")) multiplier = 1e3;
  else if (unitText.includes("Trillion")) multiplier = 1e12;

  // ดึง Fiscal Year
  const fiscalYear: string[] = [];
  $("thead tr")
    .first()
    .find("th")
    .slice(1) // ข้ามหัวข้อแรก (Fiscal Year)
    .slice(1, -1) // <-- ตัดคอลัมน์สุดท้าย
    .each((_, element) => {
      fiscalYear.push($(element).text().trim());
    });

  // ดึง Period Ending
  const periodEnding: string[] = [];
  $("thead tr")
    .eq(1)
    .find("th")
    .slice(1) // ข้ามหัวข้อแรก (Period Ending)
    .slice(1, -1) // <-- ตัดคอลัมน์สุดท้าย
    .each((_, element) => {
      const periodText = $(element).find(".hidden.sm\\:inline").text().trim();
      periodEnding.push(periodText || $(element).text().trim());
    });

  // ดึงข้อมูล Financials
  const financials: Record<string, (number | null)[]> = {};

  $("tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    const key = $(cells[0]).text().trim();
    if (!key) return;

    const values: (number | null)[] = [];
    cells.slice(1, -1).each((_, cell) => {
      // <-- ตัดคอลัมน์สุดท้าย
      const text = $(cell).text().trim().replace(/,/g, "").replace(/\$/g, "");

      if (text === "-" || text === "") {
        values.push(null);
      } else {
        const num = Number(text);
        if (isNaN(num)) {
          values.push(null);
        } else {
          if (
            key.includes("Margin") ||
            key.includes("Growth") ||
            key.includes("Yield") ||
            key.includes("Ratio") ||
            key.includes("Per Share") ||
            key.includes("Tax Rate") ||
            key.includes("Turnover") ||
            key.includes("RO") ||
            key.includes("Payout")
          ) {
            values.push(parseFloat(num.toFixed(2))); // ถ้าเป็นอัตราส่วน
          } else {
            values.push(num * multiplier); // ตัวเลขเงิน คูณหน่วย
          }
        }
      }
    });

    financials[key] = values;
  });

  return {
    fiscalYear,
    periodEnding,
    statementType,
    periodType,
    unit: unitText,
    financials,
  } as FinancialStatement;
}

export async function getStockStatistics(
  rawSymbol: string
): Promise<StockStatistics> {
  const symbol = rawSymbol
    .replace(/^BKK:/, "") // ตัด BKK: ออก
    .replace(/\.BK$/, ""); // ตัด .BK ออก
  let market = detectMarket(rawSymbol);
  let url =
    market === "us"
      ? `https://stockanalysis.com/stocks/${symbol}/statistics/`
      : `https://stockanalysis.com/quote/bkk/${symbol}/statistics/`; // <-- US ต้องใช้ /stocks/

  //https://stockanalysis.com/quote/bkk/AP/statistics/
  //https://stockanalysis.com/stocks/aapl/statistics/

  const html = await fetchHtmlSafe(url);
  const $ = cheerio.load(html);

  const statistics: StockStatistics = {
    marketCap: null,
    enterpriseValue: null,
    earningsDate: null,
    exDividendDate: null,
    sharesOutstanding: null,
    sharesChangeYoY: null,
    sharesChangeQoQ: null,
    ownedByInstitutions: null,
    peRatio: null,
    forwardPERatio: null,
    psRatio: null,
    pbRatio: null,
    ptbvRatio: null,
    pfcfRatio: null,
    pocfRatio: null,
    pegRatio: null,
    evEarnings: null,
    evSales: null,
    evEbitda: null,
    evEbit: null,
    evFcf: null,
    currentRatio: null,
    quickRatio: null,
    debtToEquity: null,
    debtToEbitda: null,
    debtToFcf: null,
    interestCoverage: null,
    returnOnEquity: null,
    returnOnAssets: null,
    returnOnInvestedCapital: null,
    returnOnCapitalEmployed: null,
    beta5Y: null,
    priceChange52W: null,
    movingAverage50D: null,
    movingAverage200D: null,
    rsi: null,
    averageVolume20D: null,
    revenue: null,
    grossProfit: null,
    operatingIncome: null,
    pretaxIncome: null,
    netIncome: null,
    ebitda: null,
    ebit: null,
    eps: null,
    cash: null,
    totalDebt: null,
    netCash: null,
    netCashPerShare: null,
    bookValue: null,
    bookValuePerShare: null,
    workingCapital: null,
    operatingCashFlow: null,
    capitalExpenditures: null,
    freeCashFlow: null,
    freeCashFlowPerShare: null,
    grossMargin: null,
    operatingMargin: null,
    pretaxMargin: null,
    profitMargin: null,
    ebitdaMargin: null,
    ebitMargin: null,
    fcfMargin: null,
    dividendPerShare: null,
    dividendYield: null,
    dividendGrowth: null,
    payoutRatio: null,
    buybackYield: null,
    shareholderYield: null,
    earningsYield: null,
    fcfYield: null,
    altmanZScore: null,
    piotroskiFScore: null,
  };

  $("table[data-test='statistics-table']").each((_, table) => {
    $(table)
      .find("tr")
      .each((_, row) => {
        const key = $(row).find("td").first().text().trim();
        const value = $(row).find("td").last().text().trim();
        const numericValue = parseValue(value);

        switch (key) {
          case "Market Cap":
            statistics.marketCap = numericValue;
            break;
          case "Enterprise Value":
            statistics.enterpriseValue = numericValue;
            break;
          case "Earnings Date":
            statistics.earningsDate = value;
            break;
          case "Ex-Dividend Date":
            statistics.exDividendDate = value;
            break;
          case "Shares Outstanding":
            statistics.sharesOutstanding = numericValue;
            break;
          case "Shares Change (YoY)":
            statistics.sharesChangeYoY = numericValue;
            break;
          case "Shares Change (QoQ)":
            statistics.sharesChangeQoQ = numericValue;
            break;
          case "Owned by Institutions (%)":
            statistics.ownedByInstitutions = numericValue;
            break;
          case "PE Ratio":
            statistics.peRatio = numericValue;
            break;
          case "Forward PE":
            statistics.forwardPERatio = numericValue;
            break;
          case "PS Ratio":
            statistics.psRatio = numericValue;
            break;
          case "PB Ratio":
            statistics.pbRatio = numericValue;
            break;
          case "P/TBV Ratio":
            statistics.ptbvRatio = numericValue;
            break;
          case "P/FCF Ratio":
            statistics.pfcfRatio = numericValue;
            break;
          case "P/OCF Ratio":
            statistics.pocfRatio = numericValue;
            break;
          case "PEG Ratio":
            statistics.pegRatio = numericValue;
            break;
          case "EV / Earnings":
            statistics.evEarnings = numericValue;
            break;
          case "EV / Sales":
            statistics.evSales = numericValue;
            break;
          case "EV / EBITDA":
            statistics.evEbitda = numericValue;
            break;
          case "EV / EBIT":
            statistics.evEbit = numericValue;
            break;
          case "EV / FCF":
            statistics.evFcf = numericValue;
            break;
          case "Current Ratio":
            statistics.currentRatio = numericValue;
            break;
          case "Quick Ratio":
            statistics.quickRatio = numericValue;
            break;
          case "Debt / Equity":
            statistics.debtToEquity = numericValue;
            break;
          case "Debt / EBITDA":
            statistics.debtToEbitda = numericValue;
            break;
          case "Debt / FCF":
            statistics.debtToFcf = numericValue;
            break;
          case "Interest Coverage":
            statistics.interestCoverage = numericValue;
            break;
          case "Return on Equity (ROE)":
            statistics.returnOnEquity = numericValue;
            break;
          case "Return on Assets (ROA)":
            statistics.returnOnAssets = numericValue;
            break;
          case "Return on Invested Capital (ROIC)":
            statistics.returnOnInvestedCapital = numericValue;
            break;
          case "Return on Capital Employed (ROCE)":
            statistics.returnOnCapitalEmployed = numericValue;
            break;
          case "Beta (5Y)":
            statistics.beta5Y = numericValue;
            break;
          case "52-Week Price Change":
            statistics.priceChange52W = numericValue;
            break;
          case "50-Day Moving Average":
            statistics.movingAverage50D = numericValue;
            break;
          case "200-Day Moving Average":
            statistics.movingAverage200D = numericValue;
            break;
          case "Relative Strength Index (RSI)":
            statistics.rsi = numericValue;
            break;
          case "Average Volume (20 Days)":
            statistics.averageVolume20D = numericValue;
            break;
          case "Revenue":
            statistics.revenue = numericValue;
            break;
          case "Gross Profit":
            statistics.grossProfit = numericValue;
            break;
          case "Operating Income":
            statistics.operatingIncome = numericValue;
            break;
          case "Pretax Income":
            statistics.pretaxIncome = numericValue;
            break;
          case "Net Income":
            statistics.netIncome = numericValue;
            break;
          case "EBITDA":
            statistics.ebitda = numericValue;
            break;
          case "EBIT":
            statistics.ebit = numericValue;
            break;
          case "Earnings Per Share (EPS)":
            statistics.eps = numericValue;
            break;
          case "Cash & Cash Equivalents":
            statistics.cash = numericValue;
            break;
          case "Total Debt":
            statistics.totalDebt = numericValue;
            break;
          case "Net Cash":
            statistics.netCash = numericValue;
            break;
          case "Net Cash Per Share":
            statistics.netCashPerShare = numericValue;
            break;
          case "Equity (Book Value)":
            statistics.bookValue = numericValue;
            break;
          case "Book Value Per Share":
            statistics.bookValuePerShare = numericValue;
            break;
          case "Working Capital":
            statistics.workingCapital = numericValue;
            break;
          case "Operating Cash Flow":
            statistics.operatingCashFlow = numericValue;
            break;
          case "Capital Expenditures":
            statistics.capitalExpenditures = numericValue;
            break;
          case "Free Cash Flow":
            statistics.freeCashFlow = numericValue;
            break;
          case "FCF Per Share":
            statistics.freeCashFlowPerShare = numericValue;
            break;
          case "Gross Margin":
            statistics.grossMargin = numericValue;
            break;
          case "Operating Margin":
            statistics.operatingMargin = numericValue;
            break;
          case "Pretax Margin":
            statistics.pretaxMargin = numericValue;
            break;
          case "Profit Margin":
            statistics.profitMargin = numericValue;
            break;
          case "EBITDA Margin":
            statistics.ebitdaMargin = numericValue;
            break;
          case "EBIT Margin":
            statistics.ebitMargin = numericValue;
            break;
          case "FCF Margin":
            statistics.fcfMargin = numericValue;
            break;
          case "Dividend Per Share":
            statistics.dividendPerShare = numericValue;
            break;
          case "Dividend Yield":
            statistics.dividendYield = numericValue;
            break;
          case "Dividend Growth (YoY)":
            statistics.dividendGrowth = numericValue;
            break;
          case "Payout Ratio":
            statistics.payoutRatio = numericValue;
            break;
          case "Buyback Yield":
            statistics.buybackYield = numericValue;
            break;
          case "Shareholder Yield":
            statistics.shareholderYield = numericValue;
            break;
          case "Earnings Yield":
            statistics.earningsYield = numericValue;
            break;
          case "FCF Yield":
            statistics.fcfYield = numericValue;
            break;
          case "Altman Z-Score":
            statistics.altmanZScore = numericValue;
            break;
          case "Piotroski F-Score":
            statistics.piotroskiFScore = numericValue;
            break;
        }
      });
  });

  return statistics;
}

// ดึงข้อมูล financials (งบย้อนหลัง) v2
export async function getStockFinancialsV2(
  rawSymbol: string,
  statementType: StatementType = "Income",
  periodType: FinancialPeriodType = "Annual"
): Promise<StatementType[]> {
  const symbol = rawSymbol.replace(/^BKK:/, "").replace(/\.BK$/, "");
  const market = detectMarket(rawSymbol);

  let baseUrl =
    market === "bkk"
      ? `https://stockanalysis.com/quote/bkk/${symbol}/`
      : `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/`;

  let url = `${baseUrl}financials/`;
  if (statementType === "Balance Sheet")
    url = `${baseUrl}financials/balance-sheet/`;
  else if (statementType === "Cash Flow")
    url = `${baseUrl}financials/cash-flow-statement/`;
  else if (statementType === "Ratios") url = `${baseUrl}financials/ratios/`;

  if (periodType === "Quarterly") url += "?p=quarterly";
  else if (periodType === "TTM") url += "?p=trailing";

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const unitRaw = $(".relative.inline-block.text-left").text().trim();
  const unitText = unitRaw
    .replace(/Data Source|Download/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let multiplier = 1;
  if (unitText.includes("Million")) multiplier = 1e6;
  else if (unitText.includes("Billion")) multiplier = 1e9;
  else if (unitText.includes("Thousand")) multiplier = 1e3;
  else if (unitText.includes("Trillion")) multiplier = 1e12;

  const fiscalYear: string[] = [];
  $("thead tr")
    .first()
    .find("th")
    .slice(1)
    .slice(1, -1)
    .each((_, element) => {
      fiscalYear.push($(element).text().trim());
    });

  const financialsMap: Record<string, (number | null)[]> = {};
  $("tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    const key = $(cells[0]).text().trim().replace(/\s/g, "");
   
    if (!key) return;
    const values: (number | null)[] = [];
    cells.slice(1, -1).each((_, cell) => {
      const text = $(cell).text().trim().replace(/,/g, "").replace(/\$/g, "");
      if (text === "-" || text === "") {
        values.push(null);
      } else {
        const num = Number(text);
        if (isNaN(num)) {
          values.push(null);
        } else {
          if (
            key.includes("Margin") ||
            key.includes("Growth") ||
            key.includes("Yield") ||
            key.includes("Ratio") ||
            key.includes("Per Share") ||
            key.includes("Tax Rate") ||
            key.includes("Turnover") ||
            key.includes("RO") ||
            key.includes("Payout")
          ) {
            values.push(parseFloat(num.toFixed(2)));
          } else {
            values.push(num * multiplier);
          }
        }
      }
    });
    financialsMap[key] = values;
  });

  // ⬇️ สร้าง Array of Object
  const result: StatementType[] = fiscalYear.map(
    (fiscalLabel, index) => {
      let quarter = "ALL";
      let year = "";

      // เช็คว่า fiscalLabel เป็น Q1 Q2 Q3 Q4 หรือ FY
      const matchQuarter = fiscalLabel.match(/(Q\d)\s+(\d{4})/);
      const matchFY = fiscalLabel.match(/FY\s+(\d{4})/);

      if (matchQuarter) {
        quarter = matchQuarter[1]; // เช่น "Q2"
        year = matchQuarter[2]; // เช่น "2024"
      } else if (matchFY) {
        year = matchFY[1]; // เช่น "2024"
      } else {
        year = fiscalLabel; // กรณีอื่น fallback ใส่ทั้ง string
      }

      const record: any = { fiscalYear: fiscalLabel, quarter, year };
      for (const [key, valueArr] of Object.entries(financialsMap)) {
        record[key] = valueArr[index] ?? null;
      }
      return record;
    }
  );

  return result;
}

function parseValue(value: string): number | null {
  if (!value || value === "n/a") return null;
  value = value.replace(/,/g, "").replace("%", "").trim();

  let multiplier = 1;
  if (value.endsWith("B")) {
    multiplier = 1e9;
    value = value.replace("B", "");
  } else if (value.endsWith("M")) {
    multiplier = 1e6;
    value = value.replace("M", "");
  } else if (value.endsWith("K")) {
    multiplier = 1e3;
    value = value.replace("K", "");
  }

  const num = parseFloat(value);
  if (isNaN(num)) return null;
  return num * multiplier;
}

export async function fetchHtmlSafe(url: string): Promise<string> {
  const res = await axios.get(url, { validateStatus: () => true });

  const isErrorPage =
    !res.data ||
    res.status >= 400 ||
    typeof res.data !== "string" ||
    res.data.includes("Page Not Found") || // fallback content
    !res.data.includes('data-test="statistics-table"'); // <<< ตรวจเจาะจงว่ามี table หรือไม่

  if (isErrorPage) {
    console.log("url error : ", url);
    throw new Error("Invalid page content (likely a 404 page)");
  }

  return res.data;
}

/*
const test = async () => {
  let data: StatementType[] = await getStockFinancialsV2(
    "AAPL",
    "Ratios",
    "Annual"
  );
   
  console.log((data[0] as IncomeStatementType).EBIT);
};

test();
*/