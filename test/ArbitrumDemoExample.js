const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("ArbitrumDemoExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const ArbitrumDemoExample = await ethers.getContractFactory("ArbitrumDemoExample");
    if (typeof ArbitrumDemoExample.deploy !== 'function') {
      throw new Error('ArbitrumDemoExample.deploy is not a function');
    }
    contract = await ArbitrumDemoExample.deploy();
  });

  it("Get ARB price securely", async function () {
    // Wrapping the contract
    if (typeof WrapperBuilder.wrap !== 'function') {
      throw new Error('WrapperBuilder.wrap is not a function');
    }
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataFeeds: ["ARB"],
    });

    // Interact with the contract (getting oracle value securely)
    if (typeof wrappedContract.getLatestPrice !== 'function') {
      throw new Error('wrappedContract.getLatestPrice is not a function');
    }
    const vstPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("ARB"));
    console.log({ vstPriceFromContract });
  });

  it("Get GMX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataFeeds: ["GMX"],
    });

    // Interact with the contract (getting oracle value securely)
    const swethPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("GMX"));
    console.log({ swethPriceFromContract });
  });
});
