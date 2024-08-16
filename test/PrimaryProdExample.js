const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("PrimaryProdExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const PrimaryProdExample = await ethers.getContractFactory("PrimaryProdExample");
    contract = await PrimaryProdExample.deploy();
  });

  it("Get VST price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["VST"],
    });

    // Interact with the contract (getting oracle value securely)
    const vstPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("VST"));
    console.log({ vstPriceFromContract });
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
