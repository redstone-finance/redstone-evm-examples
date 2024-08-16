const { WrapperBuilder } = require("@redstone-finance/evm-connector");
const { expect } = require("chai");

describe("ExampleWithHistoricalData", function () {
  // Not all timestamps can be used for querying historical data
  // Usually it's enough to round your timestamp to whole minutes
  // or do smth like `yourTimestamp - (yourTimestamp % 60_000)`
  const dataPackagesTimestamp = 1691593620000;
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const ExampleWithHistoricalData = await ethers.getContractFactory("ExampleWithHistoricalData");
    contract = await ExampleWithHistoricalData.deploy();
  });

  it.skip("Get historical STX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["STX"],
      historicalTimestamp: dataPackagesTimestamp,
    });

    // Interact with the contract (getting oracle value securely)
    const stxPrice = await wrappedContract.getHistoricalStxPrice(dataPackagesTimestamp);
    console.log({ stxPrice });
    expect(stxPrice).to.eq(58756427); // we know the exact historical value
  });
});
