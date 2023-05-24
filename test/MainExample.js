const { WrapperBuilder } = require("@redstone-finance/evm-connector");
const { formatBytes32String } = require("ethers/lib/utils");

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
      dataFeeds: ["STX"],
    });

    // Interact with the contract (getting oracle value securely)
    const stxPrice = await wrappedContract.getLatestStxPrice();
    console.log({ stxPrice });
  });


  it("Get SOFR_EFFECTIVE_DATE (decimals: 0)", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataFeeds: ["SOFR_EFFECTIVE_DATE"],
    });

    // Interact with the contract (getting oracle value securely)
    const sofrEffectiveDate = await wrappedContract.getLatestValueForDataFeed(
      formatBytes32String("SOFR_EFFECTIVE_DATE")
    );
    console.log({ sofrEffectiveDate });
  });
});
