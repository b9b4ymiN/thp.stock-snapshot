"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockOverview = getStockOverview;
exports.getStockFinancials = getStockFinancials;
exports.getStockStatistics = getStockStatistics;
exports.getStockFinancialsV2 = getStockFinancialsV2;
exports.getFairValueTable = getFairValueTable;
exports.getValuation = getValuation;
exports.getWaccAndRoicV3 = getWaccAndRoicV3;
exports.fetchHtmlSafe = fetchHtmlSafe;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
function detectMarket(symbol) {
    if (/^(BKK:|.+\.BK)$/i.test(symbol))
        return "bkk";
    return "us";
}
function cleanSymbol(rawSymbol) {
    return rawSymbol.replace(/^BKK:/, "").replace(/\.BK$/, "").toUpperCase();
}
// ดึงข้อมูล overview (ข้อมูลราคาปัจจุบัน)
async function getStockOverview(rawSymbol) {
    const market = detectMarket(rawSymbol);
    const symbol = rawSymbol
        .replace(/^BKK:/, "") // ตัด BKK: ออก
        .replace(/\.BK$/, ""); // ตัด .BK ออก
    let url = market == "bkk"
        ? `https://stockanalysis.com/quote/bkk/${symbol}/`
        : `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/`;
    const { data } = await axios_1.default.get(url);
    const $ = cheerio.load(data);
    const priceText = $("div.text-4xl.font-bold").first().text();
    const price = parseFloat(priceText.replace(",", ""));
    const findTableText = (label) => {
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
        range52Week: (() => {
            const table = $('table[data-test="overview-quote"]');
            const row = table
                .find("td")
                .filter((i, el) => $(el).text().trim() === "52-Week Range")
                .parent();
            return row.find("td").last().text().trim();
        })() || "",
        performance1Y: (() => {
            const performance = $("div.flex.shrink.flex-row.space-x-1 span")
                .first()
                .text();
            return performance.trim();
        })() || "",
    };
}
// ดึงข้อมูล financials (งบย้อนหลัง)
async function getStockFinancials(rawSymbol, statementType = "Income", periodType = "Annual") {
    const symbol = rawSymbol
        .replace(/^BKK:/, "") // ตัด BKK: ออก
        .replace(/\.BK$/, ""); // ตัด .BK ออก
    const market = detectMarket(rawSymbol);
    let baseUrl = market === "bkk"
        ? `https://stockanalysis.com/quote/bkk/${symbol}/`
        : `https://stockanalysis.com/stocks/${symbol}/`;
    let url = `${baseUrl}financials/`;
    if (statementType === "Balance Sheet") {
        url = `${baseUrl}financials/balance-sheet/`;
    }
    else if (statementType === "Cash Flow") {
        url = `${baseUrl}financials/cash-flow-statement/`;
    }
    else if (statementType === "Ratios") {
        url = `${baseUrl}financials/ratios/`;
    }
    if (periodType === "Quarterly") {
        url += "?p=quarterly";
    }
    else if (periodType === "TTM") {
        url += "?p=trailing";
    }
    const { data } = await axios_1.default.get(url);
    const $ = cheerio.load(data);
    // ดึง unit
    const unitRaw = $(".relative.inline-block.text-left").text().trim();
    const unitText = unitRaw
        .replace(/Data Source|Download/g, "")
        .replace(/\s+/g, " ")
        .trim();
    let multiplier = 1;
    if (unitText.includes("Million"))
        multiplier = 1e6;
    else if (unitText.includes("Billion"))
        multiplier = 1e9;
    else if (unitText.includes("Thousand"))
        multiplier = 1e3;
    else if (unitText.includes("Trillion"))
        multiplier = 1e12;
    // ดึง Fiscal Year
    const fiscalYear = [];
    $("thead tr")
        .first()
        .find("th")
        .slice(1) // ข้ามหัวข้อแรก (Fiscal Year)
        .slice(1, -1) // <-- ตัดคอลัมน์สุดท้าย
        .each((_, element) => {
        fiscalYear.push($(element).text().trim());
    });
    // ดึง Period Ending
    const periodEnding = [];
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
    const financials = {};
    $("tbody tr").each((_, row) => {
        const cells = $(row).find("td");
        const key = $(cells[0]).text().trim();
        if (!key)
            return;
        const values = [];
        cells.slice(1, -1).each((_, cell) => {
            // <-- ตัดคอลัมน์สุดท้าย
            const text = $(cell).text().trim().replace(/,/g, "").replace(/\$/g, "");
            if (text === "-" || text === "") {
                values.push(null);
            }
            else {
                const num = Number(text);
                if (isNaN(num)) {
                    values.push(null);
                }
                else {
                    if (key.includes("Margin") ||
                        key.includes("Growth") ||
                        key.includes("Yield") ||
                        key.includes("Ratio") ||
                        key.includes("Per Share") ||
                        key.includes("Tax Rate") ||
                        key.includes("Turnover") ||
                        key.includes("RO") ||
                        key.includes("Payout")) {
                        values.push(parseFloat(num.toFixed(2))); // ถ้าเป็นอัตราส่วน
                    }
                    else {
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
    };
}
async function getStockStatistics(rawSymbol) {
    const symbol = rawSymbol
        .replace(/^BKK:/, "") // ตัด BKK: ออก
        .replace(/\.BK$/, ""); // ตัด .BK ออก
    let market = detectMarket(rawSymbol);
    let url = market === "us"
        ? `https://stockanalysis.com/stocks/${symbol}/statistics/`
        : `https://stockanalysis.com/quote/bkk/${symbol}/statistics/`; // <-- US ต้องใช้ /stocks/
    //https://stockanalysis.com/quote/bkk/AP/statistics/
    //https://stockanalysis.com/stocks/aapl/statistics/
    const html = await fetchHtmlSafe(url);
    const $ = cheerio.load(html);
    const statistics = {
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
            console.log("🧠 key =", key, value); // เพิ่มตรงนี้ดู output จริง
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
async function getStockFinancialsV2(rawSymbol, statementType = "Income", periodType = "Annual") {
    const symbol = rawSymbol.replace(/^BKK:/, "").replace(/\.BK$/, "");
    const market = detectMarket(rawSymbol);
    let baseUrl = market === "bkk"
        ? `https://stockanalysis.com/quote/bkk/${symbol}/`
        : `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/`;
    let url = `${baseUrl}financials/`;
    if (statementType === "Balance Sheet")
        url = `${baseUrl}financials/balance-sheet/`;
    else if (statementType === "Cash Flow")
        url = `${baseUrl}financials/cash-flow-statement/`;
    else if (statementType === "Ratios")
        url = `${baseUrl}financials/ratios/`;
    if (periodType === "Quarterly")
        url += "?p=quarterly";
    else if (periodType === "TTM")
        url += "?p=trailing";
    const { data } = await axios_1.default.get(url);
    const $ = cheerio.load(data);
    const unitRaw = $(".relative.inline-block.text-left").text().trim();
    const unitText = unitRaw
        .replace(/Data Source|Download/g, "")
        .replace(/\s+/g, " ")
        .trim();
    let multiplier = 1;
    if (unitText.includes("Million"))
        multiplier = 1e6;
    else if (unitText.includes("Billion"))
        multiplier = 1e9;
    else if (unitText.includes("Thousand"))
        multiplier = 1e3;
    else if (unitText.includes("Trillion"))
        multiplier = 1e12;
    const fiscalYear = [];
    $("thead tr")
        .first()
        .find("th")
        .slice(1)
        .slice(0, -1)
        .each((_, element) => {
        fiscalYear.push($(element).text().trim());
    });
    const financialsMap = {};
    $("tbody tr").each((_, row) => {
        const cells = $(row).find("td");
        const key = $(cells[0]).text().trim().replace(/\s/g, "");
        //console.log("key : ", key);
        if (!key)
            return;
        const values = [];
        cells.slice(1, -1).each((_, cell) => {
            const text = $(cell).text().trim().replace(/,/g, "").replace(/\$/g, "");
            if (text === "-" || text === "") {
                values.push(null);
            }
            else {
                const num = Number(text.replace("%", ""));
                if (key == "PerShare")
                    console.log("PerShare : ", text, num);
                if (isNaN(num)) {
                    values.push(null);
                }
                else {
                    if (key.includes("EPS") ||
                        key.includes("Margin") ||
                        key.includes("Growth") ||
                        key.includes("Yield") ||
                        key.includes("Ratio") ||
                        key.includes("PerShare") ||
                        key.includes("TaxRate") ||
                        key.includes("Turnover") ||
                        key.includes("RO") ||
                        key.includes("Payout") ||
                        key.includes("ForwardPE")) {
                        values.push(parseFloat(num.toFixed(2)));
                    }
                    else {
                        values.push(num * multiplier);
                    }
                }
            }
        });
        financialsMap[key] = values;
    });
    // ⬇️ สร้าง Array of Object
    const result = fiscalYear.map((fiscalLabel, index) => {
        let quarter = "ALL";
        let year = "";
        // เช็คว่า fiscalLabel เป็น Q1 Q2 Q3 Q4 หรือ FY
        const matchQuarter = fiscalLabel.match(/(Q\d)\s+(\d{4})/);
        const matchFY = fiscalLabel.match(/FY\s+(\d{4})/);
        if (matchQuarter) {
            quarter = matchQuarter[1]; // เช่น "Q2"
            year = matchQuarter[2]; // เช่น "2024"
        }
        else if (matchFY) {
            year = matchFY[1]; // เช่น "2024"
        }
        else {
            year = fiscalLabel; // กรณีอื่น fallback ใส่ทั้ง string
        }
        const record = { fiscalYear: fiscalLabel, quarter, year };
        // ✅ Normalize ชื่อ key ก่อน map
        const normalizedMap = normalizeKeys(financialsMap);
        for (const [key, valueArr] of Object.entries(normalizedMap)) {
            record[key] = valueArr[index] ?? null;
        }
        return record;
    });
    return result;
}
async function getFairValueTable(symbol) {
    let url = `https://valueinvesting.io/${symbol}/valuation/intrinsic-value`; // <-- US ต้องใช้ /stocks/
    const html = await fetchHtmlSafe(url);
    const $ = cheerio.load(html);
    const table = [];
    $("table.each_summary tbody tr.hover_gray").each((_, row) => {
        const cells = $(row).find("td");
        const model = $(cells[0]).text().trim();
        const range = $(cells[1]).text().trim();
        const selected = parseFloat($(cells[2]).text().trim());
        const upside = $(cells[3]).text().trim();
        if (model && range && !isNaN(selected)) {
            table.push({ model, range, selected, upside });
        }
    });
    return table;
}
async function getValuation(symbol) {
    let baseTicker = symbol;
    if (symbol.endsWith(".BK")) {
        baseTicker = symbol.slice(0, -3); // ตัด ".BK" ออกจากท้าย
    }
    const url = `https://valueinvesting.io/${symbol}/valuation/intrinsic-value`;
    const browser = await puppeteer_extra_1.default.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
    const html = await page.content();
    const $ = cheerio.load(html);
    const result = {
        symbol: baseTicker,
        marketRiskPremium: 0,
        costOfEquity: 0,
        costOfDebt: 0,
        wacc: 0,
        valuation: [],
    };
    const allowedMethods = [
        "DCF (Growth 5y)",
        "DCF (Growth 10y)",
        "DCF (EBITDA 5y)",
        "DCF (EBITDA 10y)",
        "Fair Value",
        "P/E",
        "EV/EBITDA",
        "EPV",
        "DDM - Stable",
        "DDM - Multi",
    ];
    $("table.each_summary tr").each((_, tr) => {
        const td = $(tr).find("td");
        if (td.length === 4) {
            const method = td.eq(0).text().trim();
            if (!allowedMethods.includes(method))
                return;
            const [minStr, maxStr] = td
                .eq(1)
                .text()
                .trim()
                .split("-")
                .map((v) => v.trim());
            const selected = parseFloat(td.eq(2).text().trim());
            const upsideText = td.eq(3).text().trim().replace("%", "");
            const valueMin = parseFloat(minStr);
            const valueMax = parseFloat(maxStr);
            const upside = parseFloat(upsideText);
            result.valuation.push({ method, valueMin, valueMax, selected, upside });
        }
    });
    $("table.market_table.overview_table tr").each((_, tr) => {
        const label = $(tr).find("td").eq(0).text().trim();
        const valueText = $(tr).find("td").eq(1).text().trim().replace("%", "");
        const value = parseFloat(valueText);
        if (label.includes("Market risk premium"))
            result.marketRiskPremium = value;
        else if (label.includes("Cost of Equity"))
            result.costOfEquity = value;
        else if (label.includes("Cost of Debt"))
            result.costOfDebt = value;
        else if (label.includes("WACC"))
            result.wacc = value;
    });
    console.log("data : ", result);
    await browser.close();
    return result;
}
async function getWaccAndRoicV3(symbol) {
    let baseTicker = symbol;
    if (symbol.endsWith(".BK")) {
        baseTicker = symbol.slice(0, -3); // ตัด ".BK" ออกจากท้าย
        symbol = `BKK:${baseTicker.toUpperCase()}`; // นำหน้าด้วย "BKK:" และแปลงเป็นตัวพิมพ์ใหญ่
    }
    const url = `https://www.gurufocus.com/term/wacc/${symbol}`;
    const browser = await puppeteer_extra_1.default.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
    const html = await page.content();
    const $ = cheerio.load(html);
    const getSafeText = (selector) => $(selector).first().text()?.trim() ?? "";
    const wacc = (() => {
        const match = getSafeText("#target_def_description p").match(/cost of capital (is|was)?\s*([\d.]+)%+/i);
        return match ? Number(match[2]) : null;
    })();
    const roic = (() => {
        const match = getSafeText("#target_def_description p").match(/ROIC.*?([\d.]+)%+/i);
        return match ? Number(match[1]) : null;
    })();
    const calcPs = $("#target_def_calculation p.term_cal");
    const p0 = calcPs.eq(0).text();
    const p1 = calcPs.eq(1).text();
    const p2 = calcPs.eq(2).text();
    const p3 = calcPs.eq(3).text();
    const extractFloatAfterEqual = (text) => {
        const match = text.match(/=\s*([\d,]+\.?\d*)%?/);
        return match ? parseFloat(match[1].replace(/,/g, "")) : null;
    };
    const extractFloatFromText = (text, label) => {
        const regex = new RegExp(`${label}.*?([\\d,.]+)`, "i");
        const match = text.match(regex);
        return match ? Number(match[1].replace(/,/g, "")) : null;
    };
    const extractLastFloat = (text) => {
        const matches = text.match(/(\d+[,.]?\d*)(?=%?)(?!.*\d)/);
        return matches ? Number(matches[1].replace(/,/g, "")) : null;
    };
    const extractNumbersAfterCostOfEquity = (text) => {
        const match = text.match(/Cost of Equity\s*=\s*([\d.]+)\s*%\s*\+\s*([\d.]+)\s*\*\s*([\d.]+)\s*%\s*=\s*([\d.]+)%/);
        return match ? match.slice(1).map((n) => Number(n)) : null;
    };
    const extractNumbersFromCostOfDebtLine = (text) => {
        const lines = text.split("\n").map((l) => l.trim());
        const line = lines.find((l) => l.startsWith("Cost of Debt ="));
        const match = line?.match(/=\s*([\d.]+)\s*\/\s*([\d.]+)\s*=\s*([\d.]+)%/);
        return match ? match.slice(1).map((n) => Number(n)) : null;
    };
    // Values from Cost of Equity
    const coeParts = extractNumbersAfterCostOfEquity(p1.split("c)")[1] ?? "");
    const [riskFreeRate, beta, marketPremium, costOfEquity] = coeParts ?? [
        null,
        null,
        null,
        null,
    ];
    // Values from Cost of Debt
    const codParts = extractNumbersFromCostOfDebtLine(p2);
    const [interestExpense, totalDebt, costOfDebt] = codParts ?? [
        null,
        null,
        null,
    ];
    const Result = {
        symbol: baseTicker,
        marketCapMil: extractFloatFromText(p0, "market capitalization.*?is") ?? 0,
        bookValueDebtMil: extractFloatFromText(p0, "Book Value of Debt.*?is") ?? 0,
        weightEquity: extractLastFloat(p0.split("a)")[1] ?? "") ?? 0,
        weightDebt: extractLastFloat(p0.split("b)")[1] ?? "") ?? 0,
        taxRate: extractFloatAfterEqual(p3) ?? 0,
        // equity
        costOfEquity: costOfEquity ? costOfEquity : 0,
        riskFreeRate: riskFreeRate ? riskFreeRate : 0,
        beta: beta ? beta : 0,
        marketPremium: marketPremium ? marketPremium : 0,
        // debt
        costOfDebt: costOfDebt ? costOfDebt : 0,
        interestExpense: interestExpense ? interestExpense : 0,
        totalDebt: totalDebt ? totalDebt : 0,
        wacc: wacc ? wacc : 0,
        roic: roic ? roic : 0,
    };
    await browser.close();
    return Result;
}
function normalizeKeys(obj) {
    const normalized = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = key
            .replace(/[\/()]/g, "") // ลบ / ( )
            .replace(/\s+/g, "") // ลบช่องว่าง
            .replace(/%/g, "Percent"); // แปลง % เป็น Percent (ตามต้องการ)
        normalized[newKey] = value;
    }
    return normalized;
}
function parseValue(value) {
    if (!value)
        return null;
    const lower = value.toLowerCase().trim();
    if (lower === "n/a" || lower === "-" || lower === "--")
        return null;
    value = value.replace(/,/g, "").replace("%", "").trim();
    let multiplier = 1;
    if (value.endsWith("B")) {
        multiplier = 1e9;
        value = value.replace("B", "");
    }
    else if (value.endsWith("M")) {
        multiplier = 1e6;
        value = value.replace("M", "");
    }
    else if (value.endsWith("K")) {
        multiplier = 1e3;
        value = value.replace("K", "");
    }
    const num = parseFloat(value);
    return isNaN(num) ? null : num * multiplier;
}
async function fetchHtmlSafe(url) {
    const res = await axios_1.default.get(url, { validateStatus: () => true });
    const isErrorPage = !res.data ||
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
    "AP.BK",
    "Ratios",
    "Annual"
  );
  console.log(data[0]);
 
  //let data1 = await getStockStatistics("AP.BK");
  //console.log(data1);

  //const fairValueData = await getFairValueTable("AP.BK");
  //console.log(fairValueData);

  const data = await fetchHtmlSafe(
    "https://www.gurufocus.com/term/wacc/BKK%3AAP?utm_source=chatgpt.com"
  );
  console.log("data : ", data);
};

test();
*/
