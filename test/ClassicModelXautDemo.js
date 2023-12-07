const sdk = require("@redstone-finance/sdk");
const { WrapperBuilder } = require("@redstone-finance/evm-connector");
const {
  DataPackagesWrapper,
} = require("@redstone-finance/evm-connector/dist/src/wrappers/DataPackagesWrapper");

const getLatestSignedXAUTPrice = async () => {
  return await sdk.requestDataPackages({
    dataServiceId: "redstone-main-demo",
    uniqueSignersCount: 1,
    dataFeeds: ["XAUT"],
    urls: ["https://oracle-gateway-1.b.redstone.finance"],
  });
};

const parsePrice = (value) => {
  const bigNumberPrice = ethers.BigNumber.from(value);
  return bigNumberPrice.toNumber() / 10 ** 8; // Redstone uses 8 decimals
};

describe("ClassicModelXautDemo", function () {
  let priceFeedAdapter;
  let priceFeed;
  let priceFeedConsumer;
  let multicall;

  // Set up all contracts
  before(async () => {
    const AdapterFactory = await ethers.getContractFactory(
      "PriceFeedAdapterXautDemo"
    );
    priceFeedAdapter = await AdapterFactory.deploy();

    const PriceFeedFactory = await ethers.getContractFactory(
      "PriceFeedXautDemo"
    );
    priceFeed = await PriceFeedFactory.deploy();
    await priceFeed.setPriceFeedAdapter(priceFeedAdapter.address);

    const PriceFeedConsumerFactory = await ethers.getContractFactory(
      "SimplePriceFeedConsumer"
    );
    priceFeedConsumer = await PriceFeedConsumerFactory.deploy(
      priceFeed.address
    );

    const MulticallFactory = await ethers.getContractFactory("Multicall3");
    multicall = await MulticallFactory.deploy();
  });

  it("Should do a simple independent update", async () => {
    const dataPackagesResponse = await getLatestSignedXAUTPrice();
    const wrappedAdapter =
      WrapperBuilder.wrap(priceFeedAdapter).usingDataPackages(
        dataPackagesResponse
      );
    const { dataPackage } = dataPackagesResponse["XAUT"][0];
    const parsedPrice = parsePrice(dataPackage.dataPoints[0].value);
    console.log(`Setting XAUT price in PriceFeed contract to: ${parsedPrice}`);
    await wrappedAdapter.updateDataFeedsValues(
      dataPackage.timestampMilliseconds
    );
  });

  it("Should read latest price data", async () => {
    const latestRoundData = await priceFeed.latestRoundData();
    console.log(`Latest value the XAUT Price Feed: ${latestRoundData.answer}`);
  });

  // This is the example for the Tangible use case
  // Where we want to ensure that the tx is executed with the exactly the same
  // price that the user has in the UI
  it("Should update price and read it in a single transaction", async () => {
    // Check the initial state of the consumer (Tangible) contract
    const initialLatestSavedPrice = await priceFeedConsumer.latestSavedPrice();
    console.log(
      `Initial saved price in the consumer contract (should be zero): ${initialLatestSavedPrice}`
    );

    // Prepare update tx
    const dataPackagesResponse = await getLatestSignedXAUTPrice();
    const { dataPackage } = dataPackagesResponse["XAUT"][0];
    const parsedPrice = parsePrice(dataPackage.dataPoints[0].value);
    console.log(`User sees in the UI XAUT price: ${parsedPrice}`);
    const wrapper = new DataPackagesWrapper(dataPackagesResponse);
    const redstonePayload = await wrapper.getRedstonePayloadForManualUsage();

    // You can read more about redstone payload structure here: https://docs.redstone.finance/docs/smart-contract-devs/how-it-works#data-packing-off-chain-data-encoding
    console.log(`Redstone payload: ${redstonePayload}`);
    const redstonePayloadWithoutZeroEx = redstonePayload.replaceAll("0x", "");

    // Prepare the call with the prices update
    const callWithPriceUpdateInAdapter = {
      target: priceFeedAdapter.address,
      callData:
        priceFeedAdapter.interface.encodeFunctionData("updateDataFeedsValues", [
          dataPackage.timestampMilliseconds,
        ]) + redstonePayloadWithoutZeroEx,
    };

    // Prepare the actual call on the consumer contract (with the business logic)
    const callOnConsumerContract = {
      target: priceFeedConsumer.address,
      callData: priceFeedConsumer.interface.encodeFunctionData(
        "doSomethingWithPrice"
      ),
    };

    // The user sends a single transaction
    const multicallTx = await multicall.aggregate([
      callWithPriceUpdateInAdapter,
      callOnConsumerContract,
    ]);
    await multicallTx.wait();

    // Printing effects in the consumer contract
    const latestSavedPrice = await priceFeedConsumer.latestSavedPrice();
    console.log(
      `Latest saved price in the consumer contract: ${latestSavedPrice}`
    );
  });
});
