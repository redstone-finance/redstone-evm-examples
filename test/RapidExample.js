const { WrapperBuilder } = require("@redstone-finance/evm-connector");

describe("RapidExample", function () {
  let contract;

  beforeEach(async () => {
    // Deploy contract
    const RapidExample = await ethers.getContractFactory("RapidExample");
    contract = await RapidExample.deploy();
  });

  it("Get ETH price securely", async function () {
    // Wrapping the contract
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataPackagesIds: ["ETH"],
    });

    // Interact with the contract (getting oracle value securely)
    const ethPriceFromContract = await wrappedContract.getLatestEthPrice();
    console.log({ ethPriceFromContract });
  });
});
