const { WrapperBuilder } = require("@redstone-finance/evm-connector");
// const { expect } = require("chai");

describe("TwapsExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const TwapsExample = await ethers.getContractFactory("TwapsExample");
    contract = await TwapsExample.deploy();
  });

  it("Get ETH TWAP price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-twaps-demo",
      uniqueSignersCount: 1,
      dataFeeds: ["ETH-TWAP-60"],
    }, ["https://d33trozg86ya9x.cloudfront.net"]);

    // Interact with the contract (getting oracle value securely)
    const ethTwapPriceFromContract = await wrappedContract.getTwapEthPrice();
    console.log({ethTwapPriceFromContract: ethTwapPriceFromContract.toNumber() / (10 ** 8)});
  });
});
