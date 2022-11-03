const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("MockExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const MockExample = await ethers.getContractFactory("MockExample");
    contract = await MockExample.deploy();
  });

  it("Get AVAX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingSimpleNumericMock({
      mockSignersCount: 10,
      dataPoints: [
        { dataFeedId: "AVAX", value: 42 },
      ],
    });

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({ avaxPriceFromContract });
  });

  it("Get price for AVAX, ETH, and PNG in the same call", async () => {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingSimpleNumericMock({
      mockSignersCount: 10,
      timestampMilliseconds: Date.now(), // <- You can specify your custom timestamp, by default 1654353400000 is used
      dataPoints: [
        { dataFeedId: "AVAX", value: 42 },
        { dataFeedId: "ETH", value: 1300 },
        { dataFeedId: "PNG", value: 1.234 },
      ],
    });
    const ids = ["AVAX", "ETH", "PNG"].map(dataFeedId => formatBytes32String(dataFeedId));
    const prices = await wrappedContract.getLatestPricesForManyAssets(ids);
    console.log(prices);
  });
});
