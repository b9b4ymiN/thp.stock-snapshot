import { getStockStatistics } from "./dist"; // << ชี้มาที่ dist ได้เลย

async function run() {
  const data = await getStockStatistics("AAPL");
  console.log(data);
}

run();
