# Financial Data Scraper for Node.js

This project is a powerful and versatile web scraper built with Node.js and TypeScript for fetching a wide range of financial data for publicly traded companies across multiple international markets. It uses a combination of `axios` for static HTML fetching and `puppeteer` for dynamic, JavaScript-rendered content.

## 🚀 Features

- **Comprehensive Data:** Scrape everything from real-time stock prices to detailed historical financial statements.
- **Multiple Data Points:**
  - Current Stock Overview (price, market cap, P/E, etc.).
  - Historical Financials (Income Statement, Balance Sheet, Cash Flow).
  - Key Ratios and Statistics (ROE, P/B, Debt/Equity, etc.).
  - Advanced Valuation Metrics (WACC, ROIC, DCF Models).
- **Multiple Data Sources:** Aggregates data from leading financial websites:
  - `stockanalysis.com`
  - `valueinvesting.io`
  - `gurufocus.com`
- **Multi-Market Support:** Intelligently handles symbols from various stock exchanges (e.g., NYSE, NASDAQ, SET, HOSE, NSE) using common suffixes (`.BK`, `.VN`, `.IN`, etc.).
- **Flexible Time Periods:** Fetches financial data on an `Annual`, `Quarterly`, or `TTM` (Trailing Twelve Months) basis.
- **Robust & Resilient:** Uses `puppeteer-extra-plugin-stealth` to bypass common anti-scraping measures. Includes safe HTML fetching to handle 404 errors gracefully.
- **Modern Tech Stack:** Written in TypeScript with clear, typed interfaces for all data models.

## ⚠️ Disclaimer

This is a web scraping tool. Its functionality is entirely dependent on the HTML structure of the websites it scrapes. **If the source websites update their layout, this scraper will likely break.** Use this tool at your own risk and be prepared for maintenance.

## 🛠️ Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd <your-repo-folder>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

    > **Note:** The first time you run a function that uses `puppeteer`, it will download a recent version of the Chromium browser (\~170MB) to automate its tasks.

## Symbol Formatting

The scraper is designed to recognize stock symbols from different markets. Please use the following formats:

- **US Markets (NASDAQ, NYSE):** Use the standard ticker symbol.

  - Example: `AAPL`, `GOOGL`, `MSFT`

- **International Markets:** Use the ticker symbol followed by its common market suffix.

  - **Thailand (SET):** `AP.BK`, `PTT.BK`
  - **Vietnam (HOSE):** `VCB.VN`
  - **India (NSE):** `RELIANCE.IN`
  - **Indonesia (IDX):** `BBCA.ID`
  - **Japan (TYO):** `7203.JP`
  - **Mexico (BMV):** `AMXL.MX`

- **Alternative BKK Format:** The prefix `BKK:` is also supported for Thai stocks.

  - Example: `BKK:AP`

---

## 📖 API Reference

All functions are asynchronous and return a `Promise`.

### `getStockOverview(rawSymbol)`

Fetches a real-time overview of a stock, including its current price, market cap, and key TTM figures.

- **`rawSymbol: string`**: The stock symbol (e.g., `'AAPL'`, `'AP.BK'`).
- **Returns**: `Promise<StockOverview>`

**Example Usage:**

```typescript
import { getStockOverview } from "./scraper";

const overview = await getStockOverview("MSFT");
console.log(overview);
```

**Sample Output (`StockOverview`):**

```json
{
  "price": 444.85,
  "marketCap": "3.31T",
  "revenue": "236.58B",
  "netIncome": "86.16B",
  "eps": "11.63",
  "peRatio": "38.25",
  "dividend": "3.00 (0.67%)",
  "exDividendDate": "May 15, 2025",
  "earningsDate": "Jul 22, 2025",
  "range52Week": "309.49 - 452.75",
  "performance1Y": "+32.11%"
}
```

\<hr\>

### `getStockFinancialsV2(rawSymbol, statementType, periodType)`

Fetches historical financial data (Income, Balance Sheet, etc.) and returns it as an array of objects, where each object represents a single period. This is the recommended function for financial statements.

- **`rawSymbol: string`**: The stock symbol.
- **`statementType: StatementType`**: The financial statement to retrieve. Can be `'Income'`, `'Balance Sheet'`, `'Cash Flow'`, or `'Ratios'`. Defaults to `'Income'`.
- **`periodType: FinancialPeriodType`**: The time period. Can be `'Annual'`, `'Quarterly'`, or `'TTM'`. Defaults to `'Annual'`.
- **Returns**: `Promise<StatementType[]>` (a generic array of statement objects)

**Example Usage:**

```typescript
import { getStockFinancialsV2 } from "./scraper";

const annualRatios = await getStockFinancialsV2("BKK:AP", "Ratios", "Annual");
console.log(annualRatios[0]); // Data for the most recent year
```

**Sample Output (One element from the returned array):**

```json
{
  "fiscalYear": "FY 2024",
  "quarter": "ALL",
  "year": "2024",
  "PERatio": 6.85,
  "PSRatio": 0.89,
  "PBRatio": 0.96,
  "PFCFRatio": 7.42,
  "BookValuePerShare": 11.45,
  "RevenuePerShare": 12.33,
  "EPS": 1.6,
  "DividendYieldPercent": 6.54,
  "ROEPercent": 14.88,
  "ROAPercent": 6.01,
  "ROICPercent": 13.04,
  "CurrentRatio": 2.11,
  "DebtEquity": 1.13
  // ... and many more fields
}
```

\<hr\>

### `getStockStatistics(rawSymbol)`

Retrieves a comprehensive table of over 60 different financial statistics and valuation metrics for a stock.

- **`rawSymbol: string`**: The stock symbol.
- **Returns**: `Promise<StockStatistics>`

**Example Usage:**

```typescript
import { getStockStatistics } from "./scraper";

const stats = await getStockStatistics("AAPL");
console.log(stats);
```

**Sample Output (`StockStatistics`, truncated for brevity):**

```json
{
  "marketCap": 3258000000000,
  "enterpriseValue": 3296000000000,
  "sharesOutstanding": 15330000000,
  "peRatio": 32.55,
  "psRatio": 8.51,
  "pbRatio": 42.11,
  "returnOnEquity": 147.2,
  "returnOnAssets": 27.6,
  "debtToEquity": 2.29,
  "interestCoverage": 105.1,
  "revenue": 383290000000,
  "netIncome": 97000000000,
  "eps": 6.42,
  "dividendYield": 0.46,
  "payoutRatio": 15.1
  // ... and many more fields
}
```

\<hr\>

### `getValuation(symbol)`

Scrapes various intrinsic value models from `valueinvesting.io`. **This function uses Puppeteer** and may be slower.

- **`symbol: string`**: The stock symbol.
- **Returns**: `Promise<valuationTableModel>`

**Example Usage:**

```typescript
import { getValuation } from "./scraper";

const valuation = await getValuation("AP.BK");
console.log(valuation);
```

**Sample Output (`valuationTableModel`):**

```json
{
  "symbol": "AP",
  "marketRiskPremium": 5.5,
  "costOfEquity": 9.8,
  "costOfDebt": 3.1,
  "wacc": 7.2,
  "valuation": [
    {
      "method": "DCF (Growth 5y)",
      "valueMin": 10.5,
      "valueMax": 12.8,
      "selected": 11.6,
      "upside": 6.4
    },
    {
      "method": "P/E",
      "valueMin": 9.5,
      "valueMax": 11.5,
      "selected": 10.9,
      "upside": 0
    },
    {
      "method": "EV/EBITDA",
      "valueMin": 12.1,
      "valueMax": 14.1,
      "selected": 13.5,
      "upside": 23.8
    }
    // ... other valuation models
  ]
}
```

\<hr\>

### `getWaccAndRoicV3(symbol)`

Scrapes detailed WACC (Weighted Average Cost of Capital) and ROIC (Return on Invested Capital) calculations from `gurufocus.com`. **This function uses Puppeteer** and may be slower.

- **`symbol: string`**: The stock symbol.
- **Returns**: `Promise<GuruWACCModel>`

**Example Usage:**

```typescript
import { getWaccAndRoicV3 } from "./scraper";

const waccData = await getWaccAndRoicV3("AAPL");
console.log(waccData);
```

**Sample Output (`GuruWACCModel`):**

```json
{
  "symbol": "AAPL",
  "marketCapMil": 3257850.56,
  "bookValueDebtMil": 134591,
  "weightEquity": 0.96,
  "weightDebt": 0.04,
  "taxRate": 14.71,
  "costOfEquity": 8.87,
  "riskFreeRate": 4.25,
  "beta": 1.28,
  "marketPremium": 3.61,
  "costOfDebt": 4.14,
  "interestExpense": 5576,
  "totalDebt": 134591,
  "wacc": 8.64,
  "roic": 57.75
}
```
