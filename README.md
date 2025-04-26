# stock-snapshot

A simple TypeScript library to scrape stock overview data from [stockanalysis.com](https://stockanalysis.com).

## Usage

```ts
import { getStockOverview } from 'stock-snapshot';

const data = await getStockOverview('AOT');
console.log(data);
```
