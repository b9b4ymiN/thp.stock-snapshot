import { getStockOverview } from "./dist"; // << ชี้มาที่ dist ได้เลย

async function run() {
  const data = await getStockOverview("AAPL");
  console.log(data);
}

run();
