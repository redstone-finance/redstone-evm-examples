const { formatBytes32String } = require("ethers/lib/utils");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");
const { getSignersForDataServiceId } = require("@redstone-finance/sdk");
const { getAuthenticatedGateways } = require("../utils/authenticated-gateways");

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
      authorizedSigners: getSignersForDataServiceId("redstone-primary-prod"),
      authenticatedGateways: getAuthenticatedGateways(),
    });

    // Interact with the contract (getting oracle value securely)
    const btcPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("BTC"));
    console.log({ btcPriceFromContract });
  });

  it("Get ETH price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["ETH"],
      authorizedSigners: getSignersForDataServiceId("redstone-primary-prod"),
      authenticatedGateways: getAuthenticatedGateways(),
    });

    // Interact with the contract (getting oracle value securely)
    const ethPriceFromContract = await wrappedContract.getLatestPrice(formatBytes32String("ETH"));
    console.log({ ethPriceFromContract });
  });
});
