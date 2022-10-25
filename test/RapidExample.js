const { WrapperBuilder } = require("@redstone-finance/evm-connector");
// const { expect } = require("chai");

describe("RapidExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const RapidExample = await ethers.getContractFactory("RapidExample");
    contract = await RapidExample.deploy();
  });

  it("Get ETH price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-rapid-demo",
      uniqueSignersCount: 1,
      dataFeeds: ["ETH"],
    }, ["https://d33trozg86ya9x.cloudfront.net"]);

    // Interact with the contract (getting oracle value securely)
    const ethPriceFromContract = await wrappedContract.getLatestEthPrice();
    console.log({ethPriceFromContract: ethPriceFromContract.toNumber() / (10 ** 8)});
  });
});
