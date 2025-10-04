# Stock Snapshot

[![npm version](https://badge.fury.io/js/stock-snapshot.svg)](https://badge.fury.io/js/stock-snapshot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A comprehensive Node.js library for fetching financial data of publicly traded companies across multiple international markets. Built with TypeScript and designed for reliability, speed, and ease of use.

## ✨ Features

- **📊 Real-Time Data**: Current stock prices, market cap, trading volume, and key metrics
- **📈 Historical Financials**: Income statements, balance sheets, cash flow statements, and financial ratios
- **🌍 Multi-Market Support**: US (NASDAQ/NYSE), Thailand (SET), Vietnam (HOSE), India (NSE), and more
- **⚡ Fast & Reliable**: Intelligent caching and error handling
- **🔍 Advanced Analytics**: Valuation models, WACC calculations, and intrinsic value estimates
- **📱 TypeScript Native**: Full type safety with comprehensive interfaces
- **🛡️ Production Ready**: Built-in retry logic and graceful error handling

## 🚀 Quick Start

### Installation

```bash
npm install stock-snapshot
```

### Basic Usage

```typescript
import { getStockStatistics, getStockFinancialsV2 } from 'stock-snapshot';

// Get comprehensive stock statistics
const stats = await getStockStatistics('AAPL');
console.log(`Market Cap: $${stats.marketCap?.toLocaleString()}`);
console.log(`P/E Ratio: ${stats.peRatio}`);

// Get annual income statement data
const financials = await getStockFinancialsV2('MSFT', 'Income', 'Annual');
console.log('Recent Revenue:', financials[0]?.revenue);
```

## 📖 API Reference

### Stock Statistics

Get comprehensive financial metrics and ratios for any stock.

```typescript
getStockStatistics(symbol: string): Promise<StockStatistics>
```

**Parameters:**
- `symbol` - Stock ticker symbol (e.g., 'AAPL', 'AP.BK', 'VCB.VN')

**Returns:** Object containing 60+ financial metrics including:
- Market valuation (market cap, enterprise value)
- Profitability ratios (ROE, ROA, profit margins)
- Liquidity ratios (current ratio, quick ratio)
- Valuation multiples (P/E, P/B, EV/EBITDA)
- Growth metrics and technical indicators

**Example:**
```typescript
const stats = await getStockStatistics('TSLA');
console.log({
  marketCap: stats.marketCap,        // 800000000000
  peRatio: stats.peRatio,            // 65.4
  returnOnEquity: stats.returnOnEquity, // 28.1
  debtToEquity: stats.debtToEquity   // 0.17
});
```

### Historical Financials

Retrieve detailed financial statements across multiple periods.

```typescript
getStockFinancialsV2(
  symbol: string, 
  statementType?: 'Income' | 'Balance Sheet' | 'Cash Flow' | 'Ratios',
  periodType?: 'Annual' | 'Quarterly' | 'TTM'
): Promise<FinancialStatement[]>
```

**Parameters:**
- `symbol` - Stock ticker symbol
- `statementType` - Type of financial statement (default: 'Income')
- `periodType` - Time period for data (default: 'Annual')

**Example:**
```typescript
// Get quarterly cash flow data
const cashFlow = await getStockFinancialsV2('GOOGL', 'Cash Flow', 'Quarterly');

cashFlow.forEach(period => {
  console.log(`${period.fiscalYear}: Operating Cash Flow = $${period.operatingCashFlow}`);
});

// Get annual ratios
const ratios = await getStockFinancialsV2('AMZN', 'Ratios', 'Annual');
console.log('P/E Ratios by year:', ratios.map(r => r.peRatio));
```

### Valuation Analysis

Advanced valuation models and intrinsic value calculations.

```typescript
// DCF and comparable company analysis
getValuation(symbol: string): Promise<ValuationTableModel>

// Multi-source intrinsic value estimates  
getAlphaValue(symbol: string): Promise<AlphaValueResult>

// Fair value analysis
getFairValueTable(symbol: string): Promise<FairValueItem[]>
```

**Example:**
```typescript
// Comprehensive valuation analysis
const valuation = await getValuation('NVDA');
console.log(`WACC: ${valuation.wacc}%`);
console.log('Valuation Methods:', valuation.valuation.map(v => ({
  method: v.method,
  fairValue: v.selected,
  upside: v.upside
})));

// Get analyst consensus estimates
const estimates = await getAlphaValue('NVDA');
console.log({
  intrinsicValue: estimates.IntrinsicValue,
  analystTarget: estimates.AvgForecast,
  dcfValue: estimates.DCFValue
});
```

## 🌍 International Markets

The library supports multiple international stock exchanges with automatic market detection:

| Market | Format | Examples |
|--------|--------|----------|
| 🇺🇸 US (NASDAQ/NYSE) | `SYMBOL` | `AAPL`, `MSFT`, `GOOGL` |
| 🇹🇭 Thailand (SET) | `SYMBOL.BK` or `BKK:SYMBOL` | `PTT.BK`, `BKK:AP` |
| 🇻🇳 Vietnam (HOSE) | `SYMBOL.VN` | `VCB.VN`, `VIC.VN` |
| 🇮🇳 India (NSE) | `SYMBOL.IN` | `RELIANCE.IN`, `TCS.IN` |
| 🇮🇩 Indonesia (IDX) | `SYMBOL.ID` | `BBCA.ID`, `TLKM.ID` |
| 🇯🇵 Japan (TSE) | `SYMBOL.JP` | `7203.JP`, `6758.JP` |
| 🇲🇽 Mexico (BMV) | `SYMBOL.MX` | `AMXL.MX`, `WALMEX.MX` |

```typescript
// Examples across different markets
const usStock = await getStockStatistics('AAPL');
const thaiStock = await getStockStatistics('PTT.BK');
const vietnamStock = await getStockStatistics('VCB.VN');
const indiaStock = await getStockStatistics('RELIANCE.IN');
```

## 🔧 Configuration & Error Handling

### Environment Variables

```bash
# Enable debug logging
DEBUG_SCRAPER=1
```

### Error Handling

All functions return typed results with proper error handling:

```typescript
try {
  const stats = await getStockStatistics('INVALID_SYMBOL');
} catch (error) {
  console.error('Failed to fetch data:', error.message);
}

// Some functions return MaybeError<T> type
const result = await getStockFinancialsV2('AAPL', 'Income');
if ('error' in result) {
  console.error('API Error:', result.message);
} else {
  console.log('Success:', result[0]);
}
```

## 📊 Data Types

### StockStatistics Interface

```typescript
interface StockStatistics {
  // Valuation Metrics
  marketCap: number | null;
  enterpriseValue: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  
  // Profitability  
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  profitMargin: number | null;
  
  // Financial Health
  currentRatio: number | null;
  debtToEquity: number | null;
  interestCoverage: number | null;
  
  // Growth & Performance
  revenue: number | null;
  netIncome: number | null;
  freeCashFlow: number | null;
  eps: number | null;
  
  // 50+ additional fields...
}
```

### Financial Statement Types

```typescript
// Base structure for all financial periods
interface BaseFinancialRow {
  fiscalYear: string;    // "FY 2024", "Q2 2024"
  quarter: string;       // "Q1", "Q2", "Q3", "Q4", "ALL"
  year: string;          // "2024"
}

// Income statement data
interface IncomeStatementV2 extends BaseFinancialRow {
  revenue: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  epsBasic: number | null;
  // ... additional fields
}
```

## ⚠️ Important Notes

### Rate Limiting & Best Practices

- **Implement delays** between requests to avoid overwhelming data sources
- **Cache results** when possible to minimize API calls
- **Handle errors gracefully** as data sources may change

```typescript
// Example with rate limiting
async function fetchMultipleStocks(symbols: string[]) {
  const results = [];
  
  for (const symbol of symbols) {
    try {
      const data = await getStockStatistics(symbol);
      results.push({ symbol, data });
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn(`Failed to fetch ${symbol}:`, error.message);
    }
  }
  
  return results;
}
```

### Browser Requirements

Some functions use Puppeteer and will download Chromium (~170MB) on first use:

```typescript
// Functions that require browser automation:
// - getValuation()
// - getFairValueTable() 
// - getWaccAndRoicV3() (currently disabled)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This library fetches financial data from public sources. The accuracy and availability of data depends on external sources. Use this data for informational purposes only and not as the sole basis for investment decisions. Always verify important financial information through official sources.

**Market data may be delayed. Past performance does not guarantee future results.**

---

<div align="center">
  <strong>Built with ❤️ for the financial community</strong>
</div>

## 💖 Donate / Tip

If you find this project useful and want to support further development, you can tip me in crypto (Solana):

Solana (SOL) address: `D7cXmvrapfeC4CKnXEzMdrkRu5SWLHagUbeLMS3VA5wY`

Thank you for your support!
