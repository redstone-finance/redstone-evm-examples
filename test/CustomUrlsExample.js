const { WrapperBuilder } = require("@redstone-finance/evm-connector");

// Paused this example for now, since our custom URLs oracles
// Are not working properly
describe.skip("CustomUrlsExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const CustomUrlsExample = await ethers.getContractFactory("CustomUrlsExample");
    contract = await CustomUrlsExample.deploy();
  });

  it("Get Custom Url (Bored Ape Yacht Club floor price) price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataFeeds: ["0x60cbe6b18347697f"],
    });

    // Interact with the contract (getting oracle value securely)
    const value = await wrappedContract.getValue();
    console.log({ value });
  });
});
