const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("ArbitrumProdExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const ArbitrumProdExample = await ethers.getContractFactory("ArbitrumProdExample");
    contract = await ArbitrumProdExample.deploy();
  });

  it("Get ARB price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["ARB"],
    });

    // Interact with the contract (getting oracle value securely)
    const vstPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("ARB"));
    console.log({ vstPriceFromContract });
  });

  it("Get GMX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["GMX"],
    });

    // Interact with the contract (getting oracle value securely)
    const swethPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("GMX"));
    console.log({ swethPriceFromContract });
  });
});
