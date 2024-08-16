const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("StocksExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const StocksExample = await ethers.getContractFactory("StocksExample");
    contract = await StocksExample.deploy();
  });

  it("Get TSLA price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["TSLA"],
    });

    // Interact with the contract (getting oracle value securely)
    const tslaPriceFromContract = await wrappedContract.getLatestTslaPrice();
    console.log({ tslaPriceFromContract });
  });
});
