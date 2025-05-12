
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";

puppeteer.use(StealthPlugin());

export async function getValuation(symbol: string) {
  let baseTicker = symbol;
  if (symbol.endsWith(".BK")) {
    baseTicker = symbol.slice(0, -3); // ตัด ".BK" ออกจากท้าย
  }
  const url = `https://valueinvesting.io/${symbol}/valuation/intrinsic-value`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  const html = await page.content();
  const $ = cheerio.load(html);

  const result: {
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
  } = {
    symbol: baseTicker,
    marketRiskPremium: null,
    costOfEquity: null,
    costOfDebt: null,
    wacc: null,
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
      if (!allowedMethods.includes(method)) return;

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

    if (label.includes("Market risk premium")) result.marketRiskPremium = value;
    else if (label.includes("Cost of Equity")) result.costOfEquity = value;
    else if (label.includes("Cost of Debt")) result.costOfDebt = value;
    else if (label.includes("WACC")) result.wacc = value;
  });

  //console.log("data : ", result);
  await browser.close();
  return result;
}

export async function getWaccAndRoicV3(symbol: string) {
  let baseTicker = symbol;
  if (symbol.endsWith(".BK")) {
    baseTicker = symbol.slice(0, -3); // ตัด ".BK" ออกจากท้าย
    symbol = `BKK:${baseTicker.toUpperCase()}`; // นำหน้าด้วย "BKK:" และแปลงเป็นตัวพิมพ์ใหญ่
  }

  const url = `https://www.gurufocus.com/term/wacc/${symbol}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
  const html = await page.content();
  const $ = cheerio.load(html);

  const getSafeText = (selector: string) =>
    $(selector).first().text()?.trim() ?? "";

  const wacc = (() => {
    const match = getSafeText("#target_def_description p").match(
      /cost of capital (is|was)?\s*([\d.]+)%+/i
    );
    return match ? Number(match[2]) : null;
  })();

  const roic = (() => {
    const match = getSafeText("#target_def_description p").match(
      /ROIC.*?([\d.]+)%+/i
    );
    return match ? Number(match[1]) : null;
  })();

  const calcPs = $("#target_def_calculation p.term_cal");
  const p0 = calcPs.eq(0).text();
  const p1 = calcPs.eq(1).text();
  const p2 = calcPs.eq(2).text();
  const p3 = calcPs.eq(3).text();

  const extractFloatAfterEqual = (text: string) => {
    const match = text.match(/=\s*([\d,]+\.?\d*)%?/);
    return match ? parseFloat(match[1].replace(/,/g, "")) : null;
  };

  const extractFloatFromText = (text: string, label: string) => {
    const regex = new RegExp(`${label}.*?([\\d,.]+)`, "i");
    const match = text.match(regex);
    return match ? Number(match[1].replace(/,/g, "")) : null;
  };

  const extractLastFloat = (text: string) => {
    const matches = text.match(/(\d+[,.]?\d*)(?=%?)(?!.*\d)/);
    return matches ? Number(matches[1].replace(/,/g, "")) : null;
  };

  const extractNumbersAfterCostOfEquity = (text: string): number[] | null => {
    const match = text.match(
      /Cost of Equity\s*=\s*([\d.]+)\s*%\s*\+\s*([\d.]+)\s*\*\s*([\d.]+)\s*%\s*=\s*([\d.]+)%/
    );
    return match ? match.slice(1).map((n) => Number(n)) : null;
  };

  const extractNumbersFromCostOfDebtLine = (text: string): number[] | null => {
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

  const waccDetails = {
    symbol: baseTicker,

    marketCapMil: extractFloatFromText(p0, "market capitalization.*?is"),
    bookValueDebtMil: extractFloatFromText(p0, "Book Value of Debt.*?is"),
    weightEquity: extractLastFloat(p0.split("a)")[1] ?? ""),
    weightDebt: extractLastFloat(p0.split("b)")[1] ?? ""),
    taxRate: extractFloatAfterEqual(p3),

    // equity
    costOfEquity,
    riskFreeRate,
    beta,
    marketPremium,

    // debt
    costOfDebt,
    interestExpense,
    totalDebt,
  };

  await browser.close();

  //console.log({ wacc, roic, ...waccDetails });
  return { wacc, roic, ...waccDetails };
}

// ทดลองรัน
//getWaccAndRoicV3("AP.BK");

//getValuation("SMPC.BK");
