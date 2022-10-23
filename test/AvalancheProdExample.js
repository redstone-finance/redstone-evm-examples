const { WrapperBuilder } = require("redstone-evm-connector-exp");
// const { expect } = require("chai");

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
    }, ["https://d33trozg86ya9x.cloudfront.net"]);

    // Interact with the contract (getting oracle value securely)
    const avaxPriceFromContract = await wrappedContract.getLatestAvaxPrice();
    console.log({avaxPriceFromContract: avaxPriceFromContract.toNumber() / (10 ** 8)});
  });
});
