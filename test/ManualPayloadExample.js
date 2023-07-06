const sdk = require("redstone-sdk");
const {
  DataPackagesWrapper,
} = require("@redstone-finance/evm-connector/dist/src/wrappers/DataPackagesWrapper");
const {
  convertStringToBytes32,
} = require("redstone-protocol/dist/src/common/utils");

describe("ManualPayloadExample", function () {
  let contract;

  const getPayload = async () => {
    const dataPackages = await sdk.requestDataPackages({
      dataServiceId: "redstone-main-demo",
      uniqueSignersCount: 1,
      dataFeeds: ["STX"],
      urls: ["https://d33trozg86ya9x.cloudfront.net"],
    });
    const wrapper = new DataPackagesWrapper(dataPackages);
    const redstonePayload = await wrapper.getRedstonePayloadForManualUsage();
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
    const payload = await getPayload();
    const stxPrice = await contract.getLatestPrice(
      convertStringToBytes32("STX"),
      payload
    );
    console.log({ stxPrice });
  });

  it("Get STX price securely using external contract", async function () {
    const payload = await getPayload();
    const stxPrice = await contract.getLatestPriceFromAnotherContract(
      convertStringToBytes32("STX"),
      payload
    );
    console.log({ stxPrice });
  });
});
