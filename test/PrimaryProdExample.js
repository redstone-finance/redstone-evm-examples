const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");

const redstoneCacheLayerUrls = [
  "https://oracle-gateway-1.a.redstone.finance",
  "https://oracle-gateway-2.a.redstone.finance",
];

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
      dataFeeds: ["VST"],
      dataServiceId: "redstone-primary-prod",
      urls: redstoneCacheLayerUrls,
    });

    // Interact with the contract (getting oracle value securely)
    const vstPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("VST"));
    console.log({ vstPriceFromContract });
  });

  it("Get SWETH price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataFeeds: ["SWETH"],
      dataServiceId: "redstone-primary-prod",
      urls: redstoneCacheLayerUrls,
    });

    // Interact with the contract (getting oracle value securely)
    const swethPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("SWETH"));
    console.log({ swethPriceFromContract });
  });
});
