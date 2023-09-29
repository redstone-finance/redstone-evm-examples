const sdk = require("@redstone-finance/sdk");
const {
  DataPackagesWrapper,
} = require("@redstone-finance/evm-connector/dist/src/wrappers/DataPackagesWrapper");
const {
  convertStringToBytes32,
} = require("@redstone-finance/protocol/dist/src/common/utils");
const {
  DataServiceWrapper,
} = require("@redstone-finance/evm-connector/dist/src/wrappers/DataServiceWrapper");

describe("ManualPayloadExample", function () {
  let contract;

  const getPayload = async (contract) => {
    const wrapper = new DataServiceWrapper({
      dataServiceId: "redstone-main-demo",
      dataFeeds: ["STX"],
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

  it("Get STX price securely using manually built redstone payload", async function () {
    const payload = await getPayload(contract);
    const stxPrice = await contract.getLatestPrice(
      convertStringToBytes32("STX"),
      payload
    );
    console.log({ stxPrice });
  });

  it("Get STX price securely using external contract", async function () {
    const payload = await getPayload(contract);
    const stxPrice = await contract.getLatestPriceFromAnotherContract(
      convertStringToBytes32("STX"),
      payload
    );
    console.log({ stxPrice });
  });

  it("Get STX price securely using manually built redstone payload (using data packages wrapper)", async function () {
    // Query for data packages
    const dataPackages = await sdk.requestDataPackages({
      dataServiceId: "redstone-main-demo",
      uniqueSignersCount: 1,
      dataFeeds: ["STX"],
      urls: ["https://d33trozg86ya9x.cloudfront.net"],
    });

    // Building a payload for manual usage based on fetched data packages
    const wrapper = new DataPackagesWrapper(dataPackages);
    const redstonePayload = await wrapper.getRedstonePayloadForManualUsage();

    const stxPrice = await contract.getLatestPrice(
      convertStringToBytes32("STX"),
      redstonePayload
    );
    console.log({ stxPrice });
  });
});
