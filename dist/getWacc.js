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
exports.getValuation = getValuation;
exports.getWaccAndRoicV3 = getWaccAndRoicV3;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const cheerio = __importStar(require("cheerio"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
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
// ทดลองรัน
//getWaccAndRoicV3("AP.BK");
//getValuation("SMPC.BK");
