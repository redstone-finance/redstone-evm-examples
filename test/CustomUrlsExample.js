const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("CustomUrlsExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const CustomUrlsExample = await ethers.getContractFactory("CustomUrlsExample");
    contract = await CustomUrlsExample.deploy();
  });

  it("Get Custom Url (Bored Ape Yacht Club floor price) price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-custom-urls-demo",
      uniqueSignersCount: 2,
      dataFeeds: ["0x60cbe6b18347697f"],
    }, ["https://d1zm8lxy9v2ddd.cloudfront.net"]);

    // Interact with the contract (getting oracle value securely)
    const value = await wrappedContract.getValue();
    console.log({ value });
  });
});
