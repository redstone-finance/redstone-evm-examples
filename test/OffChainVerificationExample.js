const sdk = require("@redstone-finance/sdk");
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { hexlify } = require("ethers/lib/utils");

describe("OffChainVerificationExample", () => {
  it("Get data packages and extract signers", async () => {
    const oracleStateWithSigners = await sdk.getOracleRegistryState();
    console.log(`== RedStone oracles state ==`);
    console.log(JSON.stringify(oracleStateWithSigners, null, 2));

    const dataPackagesResponse = await sdk.requestDataPackages({
      dataFeeds: ["TON", "USDC", "USDT"],
      dataServiceId: "redstone-primary-prod",
      uniqueSignersCount: 3,
      urls: [
        "https://oracle-gateway-1.a.redstone.finance",
        "https://oracle-gateway-2.a.redstone.finance",
      ],
    });

    for (const [dataFeedId, dataPackages] of Object.entries(
      dataPackagesResponse
    )) {
      console.log(`\n\n== Data packages for ${dataFeedId} ==\n`);
      for (const signedDataPackage of dataPackages) {
        const signerAddress = signedDataPackage.recoverSignerAddress();
        // The `getDataServiceIdForSigner` function logic is very simple
        // You can check it here: https://github.com/redstone-finance/redstone-oracles-monorepo/blob/main/packages/sdk/src/index.ts#L72
        const dataServiceBySigner = sdk.getDataServiceIdForSigner(
          oracleStateWithSigners,
          signerAddress
        );
        const valueBytes = signedDataPackage.dataPackage.dataPoints[0].value;
        const valueAsBigNumber = BigNumber.from(hexlify(valueBytes));
        console.log(`Value (BigNumber): ${valueAsBigNumber.toString()}`);
        console.log(
          `Value (formatted): ${
            valueAsBigNumber.toNumber() / 10 ** 8
          }`
        );
        console.log(`Signer address: ${signerAddress}`);
        console.log(`Data service id for signer: ${dataServiceBySigner}`);
        console.log("------------------------------------");
      }
    }
  });

  it("Should fail trying to find an invalid signer", async () => {
    const oracleStateWithSigners = await sdk.getOracleRegistryState();
    const unauthorisedSigner = "0x3E1f4c6614cac82Ee6112114B37AB097d7693070";
    expect(() =>
      sdk.getDataServiceIdForSigner(oracleStateWithSigners, unauthorisedSigner)
    ).to.throw(
      "Data service not found for 0x3E1f4c6614cac82Ee6112114B37AB097d7693070"
    );
  });
});
