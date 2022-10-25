const { WrapperBuilder } = require("@redstone-finance/evm-connector");
// const { expect } = require("chai");

describe("StocksExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const StocksExample = await ethers.getContractFactory("StocksExample");
    contract = await StocksExample.deploy();
  });

  it("Get TSLA price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-stocks-demo",
      uniqueSignersCount: 1,
      dataFeeds: ["TSLA"],
    }, ["https://d33trozg86ya9x.cloudfront.net"]);

    // Interact with the contract (getting oracle value securely)
    const tslaPriceFromContract = await wrappedContract.getLatestTslaPrice();
    console.log({tslaPriceFromContract: tslaPriceFromContract.toNumber() / (10 ** 8)});
  });
});
