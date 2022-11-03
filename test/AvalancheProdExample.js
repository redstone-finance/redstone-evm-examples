const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");
// const { expect } = require("chai");

const redstoneCacheLayerUrls = ["https://d33trozg86ya9x.cloudfront.net"];

// const redstoneCacheLayerUrls = ["http://localhost:3000"];

describe("AvalancheProdExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const AvalancheProdExample = await ethers.getContractFactory("AvalancheProdExample");
    contract = await AvalancheProdExample.deploy();
  });

  it("Get AVAX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 10,
      dataFeeds: ["AVAX"],
    }, redstoneCacheLayerUrls);

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({ avaxPriceFromContract });
  });

  it("Get price for AVAX, ETH, and PNG in the same call (several data feeds specified)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 10,
      dataFeeds: ["AVAX", "ETH", "PNG"],
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });

  it("Get price for AVAX, ETH, and PNG in the same call (no data feeds specified)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount: 10,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });
});
