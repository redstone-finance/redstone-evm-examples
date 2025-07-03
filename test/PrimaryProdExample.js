const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("PrimaryProdExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const PrimaryProdExample = await ethers.getContractFactory("PrimaryProdExample");
    contract = await PrimaryProdExample.deploy();
  });

  it("Get BTC price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["BTC"],
    });

    // Interact with the contract (getting oracle value securely)
    const btcPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("BTC"));
    console.log({ btcPriceFromContract });
  });

  it("Get SWETH price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["SWETH"],
    });

    // Interact with the contract (getting oracle value securely)
    const swethPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("SWETH"));
    console.log({ swethPriceFromContract });
  });
});
