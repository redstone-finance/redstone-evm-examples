const { WrapperBuilder } = require("@redstone-finance/evm-connector");
const { getSignersForDataServiceId } = require("@redstone-finance/sdk");
const { getAuthenticatedGateways } = require("../utils/authenticated-gateways");

describe("ExampleWithHistoricalData", function () {
  // Not all timestamps can be used for querying historical data
  // Usually it's enough to round your timestamp to whole minutes
  // or do smth like `yourTimestamp - (yourTimestamp % 60_000)`
  const oneMinuteAgo = Date.now() - 60_000;
  const dataPackagesTimestamp = oneMinuteAgo - (oneMinuteAgo % 60_000);
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const ExampleWithHistoricalData = await ethers.getContractFactory("ExampleWithHistoricalData");
    contract = await ExampleWithHistoricalData.deploy();
  });

  it("Get historical BTC price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["BTC"],
      historicalTimestamp: dataPackagesTimestamp,
      authorizedSigners: getSignersForDataServiceId("redstone-primary-prod"),
      authenticatedGateways: getAuthenticatedGateways(),
    });

    // Interact with the contract (getting oracle value securely)
    const btcPrice = await wrappedContract.getHistoricalBtcPrice(dataPackagesTimestamp);
    console.log({ btcPrice });
  });
});
