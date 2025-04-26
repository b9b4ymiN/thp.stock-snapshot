# stock-snapshot

A simple TypeScript library to scrape stock overview data from [stockanalysis.com](https://stockanalysis.com).

## Usage

```ts

const { getStockOverview } = require('stock-snapshot');

async function getData() {

    //Thai
    const data = await getStockOverview('AOT.BK');
    console.log(data);

    //US
    const data2 = await getStockOverview('AAPL');
    console.log(data2);
}

getData();
```

let url = "";

if (
symbol.endsWith(".BK") ||
symbol.startsWith("BKK:") ||
symbol.length === 3
) {
// หุ้นไทย เช่น AOT
const ticker = symbol.replace(".BK", "").replace("BKK:", "").toUpperCase();
url = `https://stockanalysis.com/quote/bkk/${ticker}/`;
} else {
// หุ้นอเมริกา เช่น AAPL
url = `https://stockanalysis.com/quote/${symbol}/`;
}
