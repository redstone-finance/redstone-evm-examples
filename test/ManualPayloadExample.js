const sdk = require("@redstone-finance/sdk");
const {
  DataPackagesWrapper,
  DataServiceWrapper,
} = require("@redstone-finance/evm-connector");
const {
  utils: { convertStringToBytes32 },
} = require("@redstone-finance/protocol");
const { getAuthenticatedGateways } = require("../utils/authenticated-gateways");

describe("ManualPayloadExample", function () {
  let contract;

  const getPayload = async (contract) => {
    const wrapper = new DataServiceWrapper({
      dataServiceId: "redstone-primary-prod",
      dataPackagesIds: ["BTC"],
      authorizedSigners: sdk.getSignersForDataServiceId("redstone-primary-prod"),
      authenticatedGateways: getAuthenticatedGateways(),
    });
    const redstonePayload = await wrapper.getRedstonePayloadForManualUsage(
      contract
    );
    return redstonePayload;
  };

  beforeEach(async () => {
    // Deploy contract
    const ManualPayloadExample = await ethers.getContractFactory(
      "ManualPayloadExample"
    );
    contract = await ManualPayloadExample.deploy();
  });

  it("Get BTC price securely using manually built redstone payload", async function () {
    const payload = await getPayload(contract);
    const btcPrice = await contract.getLatestPrice(
      convertStringToBytes32("BTC"),
      payload
    );
    console.log({ btcPrice });
  });

  it("Get BTC price securely using external contract", async function () {
    const payload = await getPayload(contract);
    const btcPrice = await contract.getLatestPriceFromAnotherContract(
      convertStringToBytes32("BTC"),
      payload
    );
    console.log({ btcPrice });
  });

  it("Get BTC price securely using manually built redstone payload (using data packages wrapper)", async function () {
    // Query for data packages
    const dataPackages = await sdk.requestDataPackages({
      dataServiceId: "redstone-primary-prod",
      uniqueSignersCount: 3,
      dataPackagesIds: ["BTC"],
      authorizedSigners: sdk.getSignersForDataServiceId("redstone-primary-prod"),
      authenticatedGateways: getAuthenticatedGateways(),
    });

    // Building a payload for manual usage based on fetched data packages
    const wrapper = new DataPackagesWrapper(dataPackages);
    const redstonePayload = await wrapper.getRedstonePayloadForManualUsage();

    const btcPrice = await contract.getLatestPrice(
      convertStringToBytes32("BTC"),
      redstonePayload
    );
    console.log({ btcPrice });
  });
});
