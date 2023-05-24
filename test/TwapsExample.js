const { WrapperBuilder } = require("@redstone-finance/evm-connector");

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
      dataFeeds: ["ETH-TWAP-60"],
    });

    // Interact with the contract (getting oracle value securely)
    const ethTwapPriceFromContract = await wrappedContract.getTwapEthPrice();
    console.log({ ethTwapPriceFromContract });
  });
});
