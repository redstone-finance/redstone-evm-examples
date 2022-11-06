const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("MainExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const MainExample = await ethers.getContractFactory("MainExample");
    contract = await MainExample.deploy();
  });

  it("Get STX price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-main-demo",
      uniqueSignersCount: 1,
      dataFeeds: ["STX"],
    }, ["https://d33trozg86ya9x.cloudfront.net"]);

    // Interact with the contract (getting oracle value securely)
    const stxPrice = await wrappedContract.getLatestStxPrice();
    console.log({ stxPrice });
  });
});
