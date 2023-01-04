const { expect } = require("chai");
const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

const redstoneCacheLayerUrls = [
  "https://oracle-gateway-1.a.redstone.finance",
  "https://oracle-gateway-2.a.redstone.finance",
];
const uniqueSignersCount = 5;
const disablePayloadsDryRun = true;

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
      uniqueSignersCount,
      dataFeeds: ["AVAX"],
      disablePayloadsDryRun,
    }, redstoneCacheLayerUrls);

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({ avaxPriceFromContract });
  });

  it("Get price for AVAX, ETH, and PNG in the same call (several data feeds specified)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      dataFeeds: ["AVAX", "ETH", "PNG"],
      disablePayloadsDryRun,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });

  it("Get price for AVAX, ETH, and PNG in the same call (no data feeds specified)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      disablePayloadsDryRun,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });

  it("Get price for AVAX, ETH, and PNG in the same call (with dupliates)", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      disablePayloadsDryRun,
    }, redstoneCacheLayerUrls);
    const ids = ["AVAX", "ETH", "PNG", "ETH", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssetsWithDuplicates(ids);
    console.log(prices);
  });

  it("Should get AVAX price with only first oracle gateway", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      disablePayloadsDryRun,
      dataFeeds: ["AVAX"],
    }, [redstoneCacheLayerUrls[0]]);

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({ avaxPriceFromContract });
  });

  it("Should get AVAX price with only second oracle gateway", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      disablePayloadsDryRun,
      dataFeeds: ["AVAX"],
    }, [redstoneCacheLayerUrls[1]]);

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({ avaxPriceFromContract });
  });

  it("Should fail for missing asset", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      disablePayloadsDryRun,
      dataFeeds: ["AVAX"],
    }, redstoneCacheLayerUrls);

    const ids = ["HEHE"].map(dataFeedId => formatBytes32String(dataFeedId));
    await expect(
      wrappedContract.getLatestPricesForManyAssets(ids)
    ).to.be.revertedWithCustomError(contract, "InsufficientNumberOfUniqueSigners");
    
  });

  it("Should get price for all supported assets", async () => {
    const allSupportedDataFeedIds = [
      "GMX",
      "TJ_AVAX_sAVAX_LP",
      "YYAV3SA1",
      "YY_TJ_AVAX_ETH_LP",
      "PNG_AVAX_ETH_LP",
      "USDT",
      "YY_PTP_sAVAX",
      "TJ_AVAX_BTC_LP",
      "TJ_AVAX_USDC_LP",
      "YY_AAVE_AVAX",
      "AVAX",
      "TJ_AVAX_ETH_LP",
      "YY_TJ_AVAX_USDC_LP",
      "JOE",
      "TJ_AVAX_USDT_LP",
      "YY_PNG_AVAX_USDC_LP",
      "QI",
      "PNG_AVAX_USDT_LP",
      "USDC",
      "sAVAX",
      "ETH",
      "PTP",
      "PNG_AVAX_USDC_LP",
      "BTC",
      "LINK",
      "YAK",
      "YY_TJ_AVAX_sAVAX_LP",
      "GLP",
      "YY_PNG_AVAX_ETH_LP",
      "MOO_TJ_AVAX_USDC_LP",
      "XAVA",
      "PNG"
    ];

    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-avalanche-prod",
      uniqueSignersCount,
      disablePayloadsDryRun,
    }, redstoneCacheLayerUrls);
    const ids = allSupportedDataFeedIds.map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssetsWithDuplicates(ids);
    console.log(prices);
  });
});
