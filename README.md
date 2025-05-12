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

Function Getting data from outsource
